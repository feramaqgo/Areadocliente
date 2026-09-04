-- ============================================================
-- FERAMAQ GO — AUTENTICAÇÃO DO PORTAL DO CLIENTE + ISOLAMENTO POR CLIENTE
-- ============================================================
-- Roda DEPOIS de supabase/portal_cliente_setup.sql, no mesmo projeto do CRM.
-- Idempotente: pode rodar mais de uma vez.
--
-- POR QUE NÃO USA O SUPABASE AUTH
-- Existe um trigger em auth.users (restrict_google_auth_domain, definido em
-- supabase_google_auth_restriction.sql no repo do CRM) que APAGA qualquer
-- usuário recém-criado cujo e-mail não termine em @feramaq.com.br, em
-- qualquer INSERT. Cadastrar cliente pelo fluxo padrão do Supabase Auth
-- resultaria na conta sendo apagada. Como a regra aqui é não alterar nada
-- que já existe no CRM, este módulo constrói uma identidade paralela, só
-- para clientes, sem encostar em auth.users nem no trigger.
--
-- COMO FUNCIONA
--   Leitura  -> RLS. O Portal manda o token da sessão no header
--               `x-portal-token`; as policies resolvem esse token para um
--               contact_id e filtram por ele.
--   Escrita  -> funções SECURITY DEFINER que recebem o token, revalidam a
--               sessão E o papel do usuário. Aprovar orçamento não depende
--               de o front esconder um botão.
--
-- ⚠️ O QUE CONFERIR DEPOIS DE RODAR (não deu para testar daqui: o sandbox
--    não alcança o Supabase). Rode o bloco de verificação no fim do arquivo.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ════════════════════════════════════════════════════════════
-- PARTE 1 — Objetos novos (não encosta em nada do CRM)
-- ════════════════════════════════════════════════════════════

-- 1.1 Usuários do Portal, ancorados no contato que já existe no CRM.
CREATE TABLE IF NOT EXISTS public.portal_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  serie_login  TEXT UNIQUE,           -- login alternativo pelo nº de série
  telefone     TEXT,
  cargo        TEXT,
  senha_hash   TEXT NOT NULL,         -- bcrypt (pgcrypto)
  role         TEXT NOT NULL DEFAULT 'cliente_user'
               CHECK (role IN ('cliente_admin', 'cliente_user')),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_users_contact ON public.portal_users(contact_id);

-- 1.2 Sessões emitidas no login.
CREATE TABLE IF NOT EXISTS public.portal_sessions (
  token          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_user_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  revoked_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_user ON public.portal_sessions(portal_user_id);

-- Nenhuma policy nestas duas tabelas, de propósito: RLS ligada sem policy
-- nega tudo. Hash de senha e token de sessão não podem ser legíveis pela
-- chave anônima em hipótese alguma. O acesso é só via as funções abaixo.
ALTER TABLE public.portal_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portal_users    FROM anon, authenticated;
REVOKE ALL ON public.portal_sessions FROM anon, authenticated;


-- ════════════════════════════════════════════════════════════
-- PARTE 2 — Resolução da sessão (usada pelas policies)
-- ════════════════════════════════════════════════════════════

-- Lê o token do header da requisição. É plpgsql com EXCEPTION porque um
-- header ausente ou malformado não pode derrubar a query inteira.
CREATE OR REPLACE FUNCTION public.portal_token_da_requisicao()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_token TEXT;
BEGIN
  v_token := nullif(current_setting('request.headers', true)::json ->> 'x-portal-token', '');
  RETURN v_token::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

-- Contato (cliente) dono da sessão atual, ou NULL se não houver sessão válida.
CREATE OR REPLACE FUNCTION public.portal_current_contact()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT pu.contact_id
  FROM public.portal_sessions ps
  JOIN public.portal_users pu ON pu.id = ps.portal_user_id
  WHERE ps.token = public.portal_token_da_requisicao()
    AND ps.revoked_at IS NULL
    AND ps.expires_at > NOW()
    AND pu.active
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.portal_current_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT pu.role
  FROM public.portal_sessions ps
  JOIN public.portal_users pu ON pu.id = ps.portal_user_id
  WHERE ps.token = public.portal_token_da_requisicao()
    AND ps.revoked_at IS NULL
    AND ps.expires_at > NOW()
    AND pu.active
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.portal_current_contact() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_current_role()    TO anon, authenticated;


-- ════════════════════════════════════════════════════════════
-- PARTE 3 — Login, logout, troca de senha, provisionamento
-- ════════════════════════════════════════════════════════════

-- Login por e-mail OU número de série. Retorna token + dados do usuário.
-- Falha sempre com a mesma mensagem, para não revelar se o identificador
-- existe.
CREATE OR REPLACE FUNCTION public.portal_login(
  p_identificador TEXT,
  p_senha         TEXT
)
RETURNS TABLE (
  token       UUID,
  portal_user_id UUID,
  contact_id  UUID,
  nome        TEXT,
  email       TEXT,
  role        TEXT,
  expires_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user   public.portal_users%ROWTYPE;
  v_ident  TEXT := lower(trim(p_identificador));
  v_token  UUID;
  v_expira TIMESTAMPTZ;
BEGIN
  IF v_ident IS NULL OR v_ident = '' OR p_senha IS NULL OR p_senha = '' THEN
    RAISE EXCEPTION 'Credenciais inválidas.' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_user
  FROM public.portal_users
  WHERE lower(email) = v_ident
     OR lower(serie_login) = v_ident
  LIMIT 1;

  -- Mesma resposta para usuário inexistente, inativo ou senha errada.
  IF v_user.id IS NULL
     OR NOT v_user.active
     OR v_user.senha_hash IS NULL
     OR crypt(p_senha, v_user.senha_hash) <> v_user.senha_hash THEN
    RAISE EXCEPTION 'Credenciais inválidas.' USING ERRCODE = '28000';
  END IF;

  v_expira := NOW() + INTERVAL '7 days';

  INSERT INTO public.portal_sessions (portal_user_id, expires_at)
  VALUES (v_user.id, v_expira)
  RETURNING public.portal_sessions.token INTO v_token;

  UPDATE public.portal_users SET ultimo_login = NOW() WHERE id = v_user.id;

  RETURN QUERY SELECT
    v_token, v_user.id, v_user.contact_id, v_user.nome,
    v_user.email, v_user.role, v_expira;
END;
$$;

CREATE OR REPLACE FUNCTION public.portal_logout(p_token UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  UPDATE public.portal_sessions
  SET revoked_at = NOW()
  WHERE token = p_token AND revoked_at IS NULL;
$$;

-- Troca de senha do próprio usuário logado. Exige a senha atual e revoga as
-- outras sessões.
CREATE OR REPLACE FUNCTION public.portal_trocar_senha(
  p_senha_atual TEXT,
  p_senha_nova  TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_token UUID := public.portal_token_da_requisicao();
  v_user  public.portal_users%ROWTYPE;
BEGIN
  SELECT pu.* INTO v_user
  FROM public.portal_sessions ps
  JOIN public.portal_users pu ON pu.id = ps.portal_user_id
  WHERE ps.token = v_token
    AND ps.revoked_at IS NULL
    AND ps.expires_at > NOW()
    AND pu.active;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'Sessão inválida.' USING ERRCODE = '28000';
  END IF;

  IF crypt(p_senha_atual, v_user.senha_hash) <> v_user.senha_hash THEN
    RAISE EXCEPTION 'Senha atual incorreta.' USING ERRCODE = '28000';
  END IF;

  IF length(p_senha_nova) < 8 THEN
    RAISE EXCEPTION 'A nova senha deve ter ao menos 8 caracteres.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.portal_users
  SET senha_hash = crypt(p_senha_nova, gen_salt('bf', 12))
  WHERE id = v_user.id;

  -- Trocou a senha: derruba as demais sessões.
  UPDATE public.portal_sessions
  SET revoked_at = NOW()
  WHERE portal_user_id = v_user.id AND token <> v_token AND revoked_at IS NULL;
END;
$$;

-- Provisionamento. Sem GRANT para anon: só a equipe interna (chave de
-- serviço / SQL Editor) cria acesso de cliente.
CREATE OR REPLACE FUNCTION public.portal_criar_usuario(
  p_contact_id  UUID,
  p_nome        TEXT,
  p_email       TEXT,
  p_senha       TEXT,
  p_role        TEXT DEFAULT 'cliente_user',
  p_serie_login TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF length(p_senha) < 8 THEN
    RAISE EXCEPTION 'A senha deve ter ao menos 8 caracteres.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.portal_users (contact_id, nome, email, serie_login, senha_hash, role)
  VALUES (
    p_contact_id, p_nome, lower(trim(p_email)), lower(nullif(trim(p_serie_login), '')),
    crypt(p_senha, gen_salt('bf', 12)), p_role
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_login(TEXT, TEXT)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_logout(UUID)              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_trocar_senha(TEXT, TEXT)  TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_criar_usuario(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon, authenticated;


-- ════════════════════════════════════════════════════════════
-- PARTE 4 — Escritas do Portal (papel revalidado no banco)
-- ════════════════════════════════════════════════════════════

-- Abrir chamado. O contact_id vem da sessão, nunca do cliente, e numero_os
-- é gerado pelo trigger que já existe no CRM (t_generate_numero_os).
CREATE OR REPLACE FUNCTION public.portal_abrir_chamado(
  p_equipamento  TEXT,
  p_numero_serie TEXT,
  p_tipo_problema TEXT,
  p_descricao    TEXT,
  p_prioridade   TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_contact UUID := public.portal_current_contact();
  v_os_id   UUID;
BEGIN
  IF v_contact IS NULL THEN
    RAISE EXCEPTION 'Sessão inválida.' USING ERRCODE = '28000';
  END IF;

  IF p_prioridade NOT IN ('baixa', 'normal', 'alta', 'critica') THEN
    p_prioridade := 'normal';
  END IF;

  INSERT INTO public.service_orders (
    numero_os, contact_id, equipamento, numero_serie,
    tipo_problema, descricao_inicial, prioridade, status
  )
  VALUES (
    'PENDENTE', v_contact, p_equipamento, p_numero_serie,
    p_tipo_problema, p_descricao, p_prioridade, 'aberto'
  )
  RETURNING id INTO v_os_id;

  RETURN v_os_id;
END;
$$;

-- Aprovar / recusar orçamento. É AQUI que o papel de gestor é aplicado de
-- verdade — esconder o botão no front não é controle de acesso.
CREATE OR REPLACE FUNCTION public.portal_decidir_orcamento(
  p_quote_id UUID,
  p_decisao  TEXT           -- 'aprovado' | 'rejeitado'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_contact UUID := public.portal_current_contact();
  v_role    TEXT := public.portal_current_role();
BEGIN
  IF v_contact IS NULL THEN
    RAISE EXCEPTION 'Sessão inválida.' USING ERRCODE = '28000';
  END IF;

  IF v_role <> 'cliente_admin' THEN
    RAISE EXCEPTION 'Apenas o gestor da conta pode decidir orçamentos.' USING ERRCODE = '42501';
  END IF;

  IF p_decisao NOT IN ('aprovado', 'rejeitado') THEN
    RAISE EXCEPTION 'Decisão inválida.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.quotes
  SET status = p_decisao, updated_at = NOW()
  WHERE id = p_quote_id
    AND contact_id = v_contact      -- não decide orçamento de outro cliente
    AND status IN ('enviado', 'rascunho');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orçamento não encontrado ou já decidido.' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

-- Mensagem do cliente dentro de um chamado.
CREATE OR REPLACE FUNCTION public.portal_enviar_mensagem(
  p_service_order_id UUID,
  p_mensagem         TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_contact UUID := public.portal_current_contact();
  v_nome    TEXT;
  v_msg_id  UUID;
BEGIN
  IF v_contact IS NULL THEN
    RAISE EXCEPTION 'Sessão inválida.' USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE id = p_service_order_id AND contact_id = v_contact
  ) THEN
    RAISE EXCEPTION 'Chamado não encontrado.' USING ERRCODE = 'P0002';
  END IF;

  SELECT pu.nome INTO v_nome
  FROM public.portal_sessions ps
  JOIN public.portal_users pu ON pu.id = ps.portal_user_id
  WHERE ps.token = public.portal_token_da_requisicao();

  INSERT INTO public.service_order_client_messages (
    service_order_id, autor_tipo, autor_contact_id, autor_nome, mensagem
  )
  VALUES (p_service_order_id, 'cliente', v_contact, COALESCE(v_nome, 'Cliente'), p_mensagem)
  RETURNING id INTO v_msg_id;

  RETURN v_msg_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_abrir_chamado(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_decidir_orcamento(UUID, TEXT)               TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_enviar_mensagem(UUID, TEXT)                 TO anon, authenticated;


-- ════════════════════════════════════════════════════════════
-- PARTE 5 — Corrige as policies frouxas do portal_cliente_setup.sql
-- ════════════════════════════════════════════════════════════
-- Aquele arquivo criou as tabelas do Portal com USING (true) para
-- authenticated, o que significa "todo cliente logado enxerga a tabela
-- inteira". Isto substitui essas policies por recorte real. São policies
-- criadas por nós mesmos naquela migration — nada do CRM é afetado aqui.

DROP POLICY IF EXISTS "client_machines_authenticated_select" ON public.client_machines;
DROP POLICY IF EXISTS "client_machines_authenticated_write"  ON public.client_machines;

CREATE POLICY "client_machines_portal_select" ON public.client_machines
  FOR SELECT TO anon, authenticated
  USING (contact_id = public.portal_current_contact());

-- Cadastro de equipamento é da equipe Feramaq, não do cliente.
CREATE POLICY "client_machines_staff_write" ON public.client_machines
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gestor', 'gestor_manutencao'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'gestor', 'gestor_manutencao'));

DROP POLICY IF EXISTS "os_client_messages_authenticated" ON public.service_order_client_messages;

CREATE POLICY "os_client_messages_portal_select" ON public.service_order_client_messages
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_orders so
      WHERE so.id = service_order_id
        AND so.contact_id = public.portal_current_contact()
    )
  );

-- Escrita do cliente passa por portal_enviar_mensagem(); a equipe escreve
-- direto pelo CRM.
CREATE POLICY "os_client_messages_staff" ON public.service_order_client_messages
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "os_client_attachments_authenticated" ON public.service_order_client_attachments;

CREATE POLICY "os_client_attachments_portal_select" ON public.service_order_client_attachments
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_orders so
      WHERE so.id = service_order_id
        AND so.contact_id = public.portal_current_contact()
    )
  );

CREATE POLICY "os_client_attachments_staff" ON public.service_order_client_attachments
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "client_announcement_reads_authenticated" ON public.client_announcement_reads;

CREATE POLICY "client_announcement_reads_portal" ON public.client_announcement_reads
  FOR ALL TO anon, authenticated
  USING (contact_id = public.portal_current_contact())
  WITH CHECK (contact_id = public.portal_current_contact());


-- ════════════════════════════════════════════════════════════
-- PARTE 6 — ⚠️ A ÚNICA PARTE QUE TOCA EM TABELA DO CRM
-- ════════════════════════════════════════════════════════════
-- Sem isto o Portal não consegue ler NADA do CRM: contacts, service_orders,
-- quotes e products têm RLS exigindo auth.uid(), que o cliente do Portal
-- nunca terá.
--
-- Leia antes de rodar:
--   • São apenas CREATE POLICY. Nenhuma policy existente é alterada ou
--     removida, nenhuma coluna muda, nenhum dado é tocado.
--   • Policies permissivas se somam com OR. O acesso atual da equipe
--     continua exatamente igual; isto só ACRESCENTA a possibilidade de uma
--     sessão de cliente válida ler as próprias linhas.
--   • Todas são FOR SELECT. O Portal não ganha escrita direta em nenhuma
--     tabela do CRM — escrita só pelas funções da Parte 4.
--   • Se portal_current_contact() devolver NULL (sem sessão), a condição é
--     falsa e nada é liberado.
--
-- Se preferir revisar com o time antes, rode as Partes 1–5 agora e deixe
-- esta para depois: o Portal continua funcionando com os dados mockados.

-- Cliente lê o próprio cadastro.
DROP POLICY IF EXISTS "portal_le_proprio_contato" ON public.contacts;
CREATE POLICY "portal_le_proprio_contato" ON public.contacts
  FOR SELECT TO anon, authenticated
  USING (id = public.portal_current_contact());

-- ...e a empresa dele (ligação por CNPJ, como o CRM já faz).
DROP POLICY IF EXISTS "portal_le_propria_empresa" ON public.companies;
CREATE POLICY "portal_le_propria_empresa" ON public.companies
  FOR SELECT TO anon, authenticated
  USING (
    cnpj IN (
      SELECT c.cnpj FROM public.contacts c
      WHERE c.id = public.portal_current_contact() AND c.cnpj IS NOT NULL
    )
  );

-- Chamados (OS) do próprio cliente.
DROP POLICY IF EXISTS "portal_le_proprias_os" ON public.service_orders;
CREATE POLICY "portal_le_proprias_os" ON public.service_orders
  FOR SELECT TO anon, authenticated
  USING (contact_id = public.portal_current_contact());

-- Orçamentos do próprio cliente. Rascunho fica fora: o cliente não deve ver
-- proposta que o comercial ainda não enviou.
DROP POLICY IF EXISTS "portal_le_proprios_orcamentos" ON public.quotes;
CREATE POLICY "portal_le_proprios_orcamentos" ON public.quotes
  FOR SELECT TO anon, authenticated
  USING (
    contact_id = public.portal_current_contact()
    AND status <> 'rascunho'
  );

-- Catálogo de peças: não é dado de cliente, mas exige sessão válida.
DROP POLICY IF EXISTS "portal_le_catalogo_pecas" ON public.products;
CREATE POLICY "portal_le_catalogo_pecas" ON public.products
  FOR SELECT TO anon, authenticated
  USING (
    public.portal_current_contact() IS NOT NULL
    AND category = 'pecas'
  );


NOTIFY pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════
-- VERIFICAÇÃO (rode manualmente depois da migration)
-- ════════════════════════════════════════════════════════════
-- 1) Criar um usuário de teste a partir de um contato real:
--
--    SELECT public.portal_criar_usuario(
--      (SELECT id FROM public.contacts WHERE cnpj IS NOT NULL LIMIT 1),
--      'Usuário Teste', 'teste@cliente.com.br', 'senha-de-teste-123',
--      'cliente_admin', NULL
--    );
--
-- 2) Login deve devolver um token:
--
--    SELECT * FROM public.portal_login('teste@cliente.com.br', 'senha-de-teste-123');
--
-- 3) Senha errada deve falhar com "Credenciais inválidas.":
--
--    SELECT * FROM public.portal_login('teste@cliente.com.br', 'errada');
--
-- 4) O ponto que NÃO consegui testar daqui: se o PostgREST está mesmo
--    repassando o header. Com o token do passo 2, rode no terminal:
--
--    curl 'https://iqttjifqjawigwlvcjgm.supabase.co/rest/v1/service_orders?select=numero_os' \
--      -H "apikey: <ANON_KEY>" \
--      -H "x-portal-token: <TOKEN_DO_PASSO_2>"
--
--    Esperado: só as OS daquele contato. Sem o header: lista vazia.
--    Se vier vazio COM o header, o repasse de header é o problema — me
--    avise que eu troco a leitura para funções RPC, que não dependem disso.
--
-- 5) Confirme que o hash não vaza pela chave anônima (deve dar erro/vazio):
--
--    curl 'https://iqttjifqjawigwlvcjgm.supabase.co/rest/v1/portal_users?select=*' \
--      -H "apikey: <ANON_KEY>"
