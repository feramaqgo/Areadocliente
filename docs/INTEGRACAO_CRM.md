# Integração Portal do Cliente ↔ CRM (Feramaq Go)

O Portal e o CRM (repo `feramaqgo/FeeraMaq-Go---2.0N`) compartilham o **mesmo
projeto Supabase** (`iqttjifqjawigwlvcjgm`). Este documento registra o que foi
levantado no schema real do CRM, o que já foi criado para o Portal, e o que
ainda depende de decisão.

## Status geral

| Peça | Situação |
|---|---|
| Cliente Supabase do Portal (`src/lib/supabase.ts`) | ✅ Pronto |
| Tabelas novas do Portal (`supabase/portal_cliente_setup.sql`) | ✅ Escrita, **precisa ser rodada** no SQL Editor do Supabase |
| Manuais técnicos | ✅ Ligado ao Supabase real (tabela `manuals`, pública) |
| Comunicados ao cliente | ✅ Ligado ao Supabase real (tabela `client_announcements`, pública) |
| Chamados, Orçamentos, Peças, Empresa/Usuário | ⏸️ Bloqueado — depende da decisão de autenticação (abaixo) |
| Máquinas do cliente | ⏸️ Tabela criada (`client_machines`), mas RLS exige `authenticated` — inerte até haver login real |
| Chat/anexos do chamado visíveis ao cliente | ⏸️ Tabelas criadas, mesma dependência |

## Mapeamento de entidades

| Tipo do Portal (`src/types.ts`) | Fonte real | Observações |
|---|---|---|
| `Empresa` | `public.companies` (por CNPJ) | |
| `Usuario` | `public.contacts` | É o cadastro de **lead/cliente do funil de vendas**, não um usuário de login. Não tem `role` (`cliente_admin`/`cliente_user`) nem `serie_login` — são conceitos novos do Portal. |
| `Maquina` | **Nova**: `public.client_machines` | O CRM não tinha cadastro estruturado de equipamento do cliente — só texto livre (`service_orders.equipamento`/`numero_serie`). |
| `Chamado` | `public.service_orders` | Ver tradução de status abaixo. Chama-se "OS" (Ordem de Serviço) no CRM. |
| `ChamadoMensagem` | **Nova**: `public.service_order_client_messages` | `service_notes` existente é interno (flag `visivel_vendedor`), não serve pro cliente. |
| `ChamadoAnexo` | **Nova**: `public.service_order_client_attachments` | Reaproveita o bucket de storage `at-fotos` que já existe. |
| `Orcamento` | `public.quotes` | Ver tradução de status abaixo. |
| `Manual` | **Nova**: `public.manuals` (+ bucket `manuais`) | Não existia no CRM. |
| `Peca` | `public.products` (`category = 'pecas'`) | |
| `Relatorio` | Sem equivalente direto | O mais próximo é `public.attachments` (bucket `garantias`, PDFs de garantia gerados na entrega da venda). Não há um módulo de "relatórios de telemetria/eficiência" no CRM — se o cliente precisa disso de verdade, é um módulo novo a discutir. |
| `Atualizacao` | **Nova**: `public.client_announcements` | `public.announcements` existente é só para a equipe interna. |
| `LogAtividade` | Sem equivalente — mantido só local por enquanto | |

## Tradução de status (a UI do Portal usa os valores da esquerda; o banco usa os da direita)

**Chamado → `service_orders.status`**

| Portal | CRM |
|---|---|
| Aberto | `aberto` |
| Em Atendimento | `em_andamento` |
| Aguardando Peça | `aguardando_peca` |
| *(sem equivalente hoje)* | `aguardando_cliente` |
| Concluído | `resolvido` ou `encerrado` |
| *(sem equivalente hoje)* | `cancelado` |

`Chamado.urgencia` (`Normal`/`Urgente`) também não bate 1:1 com
`service_orders.prioridade` (`baixa`/`normal`/`alta`/`critica`) — sugestão:
`Normal` → `normal`, `Urgente` → `alta` (deixando `baixa`/`critica` como
valores que só o CRM usa internamente).

**Orçamento → `quotes.status`**

| Portal | CRM |
|---|---|
| Pendente | `rascunho` ou `enviado` |
| Aprovado | `aprovado` |
| Recusado | `rejeitado` |
| *(sem equivalente hoje)* | `expirado` |

## ⚠️ Achado bloqueante: autenticação de clientes

Não existe, hoje, nenhum mecanismo de login para clientes no CRM —
`public.profiles` (e `auth.users`) são só para a equipe interna Feramaq.

Pior: existe um trigger (`restrict_google_auth_domain`, definido em
`supabase_google_auth_restriction.sql` no repo do CRM) que **apaga
qualquer usuário recém-criado em `auth.users` cujo e-mail não termine em
`@feramaq.com.br`** — e ele dispara em **qualquer INSERT** na tabela,
independente do provider. O comentário no código (e a Edge Function
`auth-hook`) diz que a restrição deveria valer só para login via Google,
mas o trigger em si não checa o provider. Ou seja: hoje, cadastrar um
cliente (`carlos@construtoraprime.com.br`) via Supabase Auth padrão
resultaria na conta sendo apagada segundos depois de criada.

**Isso não foi alterado nesta migration** — por pedido explícito, nada que
já existe no CRM foi tocado. Decisão registrada para quando o time
decidir o caminho de autenticação:

1. **Corrigir o trigger** para só bloquear login Google fora do domínio
   (como o comentário original já dizia que deveria ser), liberando
   signup padrão de e-mail+senha para clientes via Supabase Auth. Mantém
   RLS nativa via `auth.uid()` em tudo — inclusive nas tabelas novas deste
   documento, que já foram desenhadas esperando por isso (ver comentários
   `TODO(auth-cliente)` no SQL).
2. **Tabela de auth separada para clientes** (`portal_users`, senha com
   hash, fora de `auth.users`), com uma Edge Function fazendo a
   verificação de senha e emitindo sessão. Mais isolado do CRM, mas exige
   uma camada própria em vez de usar `auth.uid()` direto no RLS.

Enquanto isso não é decidido, `src/components/Auth.tsx` continua com o
login mockado (aceita qualquer senha com 4+ caracteres), como já estava.

## Como ativar o que está pronto

1. Rodar `supabase/portal_cliente_setup.sql` no SQL Editor do Supabase
   (Dashboard → SQL Editor). É idempotente e só cria objetos novos.
2. Manuais e Comunicados já funcionam com o Supabase real assim que a
   migration rodar — não dependem de login.
3. Chamados/Orçamentos/Peças/Empresa e as tabelas novas restritas a
   `authenticated` continuam bloqueados até a decisão de autenticação
   acima ser tomada.
