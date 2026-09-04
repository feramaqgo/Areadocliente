-- ============================================================
-- FERAMAQ GO — MÓDULO PORTAL DO CLIENTE (ÁREA DO CLIENTE)
-- ============================================================
-- Migration 100% ADITIVA sobre o banco do CRM (mesmo projeto Supabase,
-- ref iqttjifqjawigwlvcjgm). Não altera, não remove e não recria nenhuma
-- tabela, função, trigger ou policy já existente do Feramaq Go — só cria
-- objetos novos (CREATE TABLE IF NOT EXISTS / CREATE POLICY novas).
--
-- Execute no SQL Editor do Supabase (Dashboard → SQL Editor). Idempotente:
-- pode rodar mais de uma vez sem efeito colateral.
--
-- Contexto / decisões registradas (ver docs/INTEGRACAO_CRM.md no repo do
-- portal para o mapeamento completo):
--
--   1. Ainda NÃO existe autenticação de clientes no CRM (profiles.role só
--      cobre a equipe interna). Enquanto isso não é decidido, as tabelas
--      abaixo que carregam dado específico de cliente (client_machines,
--      service_order_client_messages, service_order_client_attachments)
--      ficam com RLS restrita a "authenticated" — ou seja, inertes para o
--      Portal até existir uma sessão real de cliente. Isso é proposital:
--      não abrimos dado de cliente (localização de máquina, conteúdo de
--      chamado) pra chave anônima só pra "funcionar mais rápido".
--
--   2. `manuals` e `client_announcements` são catálogos/broadcasts sem
--      recorte por cliente (não têm dado sensível por si só), então ficam
--      com SELECT liberado também para `anon` — o Portal já consegue usar
--      essas duas tabelas hoje, mesmo sem login de cliente resolvido.
--
--   3. Há um trigger em auth.users (restrict_google_auth_domain, em
--      supabase_google_auth_restriction.sql) que apaga qualquer usuário
--      cujo e-mail não termine em @feramaq.com.br, em QUALQUER INSERT (não
--      só login Google, apesar do comentário original dizer que deveria
--      ser só Google). Isso PRECISA ser resolvido antes de cadastrar
--      clientes via Supabase Auth padrão — não mexemos nisso aqui.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. Máquinas do cliente (equipamento instalado + histórico técnico)
-- ────────────────────────────────────────────────────────────
-- Hoje o CRM só guarda "equipamento"/"numero_serie" como texto livre
-- dentro de service_orders, sem um cadastro estruturado por cliente.
CREATE TABLE IF NOT EXISTS public.client_machines (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id             UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  origem_service_order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
  serie                  TEXT NOT NULL UNIQUE,
  modelo                 TEXT NOT NULL,
  linha                  TEXT,
  ano_fabricacao         INTEGER,
  data_compra            DATE,
  status                 TEXT DEFAULT 'operacional' CHECK (status IN ('operacional', 'em_manutencao', 'aguardando_peca', 'desativada')),
  horimetro              INTEGER DEFAULT 0,
  ultima_manutencao      DATE,
  localizacao            TEXT,
  garantia_ate           DATE,
  imagem_url             TEXT,
  fabricante             TEXT DEFAULT 'Feramaq Industrial',
  potencia_motor         TEXT,
  rotacao_maxima         TEXT,
  diametro_torneamento   TEXT,
  comprimento_maximo     TEXT,
  comando_numerico       TEXT,
  peso_bruto             TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_machines_contact ON public.client_machines(contact_id);

ALTER TABLE public.client_machines ENABLE ROW LEVEL SECURITY;

-- Dado sensível de cliente (localização, série, garantia): só authenticated.
-- Sem policy para `anon` de propósito.
DROP POLICY IF EXISTS "client_machines_authenticated_select" ON public.client_machines;
CREATE POLICY "client_machines_authenticated_select" ON public.client_machines
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "client_machines_authenticated_write" ON public.client_machines;
CREATE POLICY "client_machines_authenticated_write" ON public.client_machines
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- TODO(auth-cliente): apertar para contact_id = contato vinculado ao
-- usuário logado do Portal, assim que a autenticação de clientes existir.


-- ────────────────────────────────────────────────────────────
-- 2. Manuais técnicos (catálogo público de PDFs, sem recorte por cliente)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.manuals (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo             TEXT NOT NULL,
  descricao          TEXT,
  modelo_compativel  TEXT,
  categoria          TEXT CHECK (categoria IN ('Elétrica', 'Mecânica', 'Hidráulica', 'Operação')),
  storage_path       TEXT NOT NULL,           -- caminho no bucket 'manuais'
  tamanho_bytes      BIGINT,
  created_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.manuals ENABLE ROW LEVEL SECURITY;

-- Catálogo público de documentação técnica: leitura liberada, sem PII.
DROP POLICY IF EXISTS "manuals_public_select" ON public.manuals;
CREATE POLICY "manuals_public_select" ON public.manuals
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "manuals_staff_write" ON public.manuals;
CREATE POLICY "manuals_staff_write" ON public.manuals
  FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gestor')
  ) WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gestor')
  );

-- Bucket de storage para os PDFs de manuais.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('manuais', 'manuais', true, 26214400, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "manuais_bucket_public_read" ON storage.objects;
CREATE POLICY "manuais_bucket_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'manuais');

DROP POLICY IF EXISTS "manuais_bucket_staff_write" ON storage.objects;
CREATE POLICY "manuais_bucket_staff_write" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'manuais'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gestor')
  );


-- ────────────────────────────────────────────────────────────
-- 3. Comunicados para clientes (broadcast, sem recorte por cliente na v1)
-- ────────────────────────────────────────────────────────────
-- Separado de public.announcements de propósito: aquela tabela é só para
-- a equipe interna (target_role usa papéis internos).
CREATE TABLE IF NOT EXISTS public.client_announcements (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo            TEXT NOT NULL,
  conteudo          TEXT NOT NULL,
  sender_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_announcements_public_select" ON public.client_announcements;
CREATE POLICY "client_announcements_public_select" ON public.client_announcements
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "client_announcements_staff_write" ON public.client_announcements;
CREATE POLICY "client_announcements_staff_write" ON public.client_announcements
  FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gestor')
  ) WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gestor')
  );

-- Confirmação de leitura por cliente. Já fica pronta, mas só é útil quando
-- existir uma identidade de cliente pra popular contact_id — RLS restrita a
-- authenticated, então fica inerte no Portal até a decisão de auth.
CREATE TABLE IF NOT EXISTS public.client_announcement_reads (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id       UUID NOT NULL REFERENCES public.client_announcements(id) ON DELETE CASCADE,
  contact_id            UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  read_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (announcement_id, contact_id)
);

ALTER TABLE public.client_announcement_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_announcement_reads_authenticated" ON public.client_announcement_reads;
CREATE POLICY "client_announcement_reads_authenticated" ON public.client_announcement_reads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- TODO(auth-cliente): restringir para contact_id do usuário logado.


-- ────────────────────────────────────────────────────────────
-- 4. Chat e anexos visíveis ao cliente dentro de uma OS (service_order)
-- ────────────────────────────────────────────────────────────
-- Separado de public.service_notes de propósito: aquela tabela usa
-- `visivel_vendedor` (visibilidade pro vendedor), não pro cliente, e é
-- espelhada automaticamente em contact_notes por um trigger existente —
-- não queremos que mensagens do Portal entrem nesse fluxo sem revisão.
CREATE TABLE IF NOT EXISTS public.service_order_client_messages (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id  UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  autor_tipo        TEXT NOT NULL CHECK (autor_tipo IN ('cliente', 'suporte')),
  autor_contact_id  UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  autor_profile_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome        TEXT NOT NULL,
  mensagem          TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_os_client_messages_os ON public.service_order_client_messages(service_order_id);

ALTER TABLE public.service_order_client_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_client_messages_authenticated" ON public.service_order_client_messages;
CREATE POLICY "os_client_messages_authenticated" ON public.service_order_client_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- TODO(auth-cliente): restringir SELECT/INSERT ao contato dono da OS
-- (service_orders.contact_id) e à equipe atribuída/aberta.

CREATE TABLE IF NOT EXISTS public.service_order_client_attachments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id  UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  message_id        UUID REFERENCES public.service_order_client_messages(id) ON DELETE CASCADE,
  nome_arquivo      TEXT NOT NULL,
  storage_path      TEXT NOT NULL,           -- caminho no bucket 'at-fotos' (já existe, criado em supabase_at.sql)
  tamanho_bytes     BIGINT,
  tipo_mime         TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_os_client_attachments_os ON public.service_order_client_attachments(service_order_id);

ALTER TABLE public.service_order_client_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_client_attachments_authenticated" ON public.service_order_client_attachments;
CREATE POLICY "os_client_attachments_authenticated" ON public.service_order_client_attachments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- TODO(auth-cliente): mesma restrição de service_order_client_messages.
-- Upload de arquivo usa o bucket 'at-fotos' que já existe (supabase_at.sql)
-- e já aceita INSERT de qualquer autenticado — nenhuma mudança de storage
-- necessária aqui.

NOTIFY pgrst, 'reload schema';
