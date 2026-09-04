# Integração Portal do Cliente ↔ CRM (Feramaq Go)

O Portal e o CRM (repo `feramaqgo/FeeraMaq-Go---2.0N`) compartilham o **mesmo
projeto Supabase** (`iqttjifqjawigwlvcjgm`). Este documento registra o que foi
levantado no schema real do CRM, o que já foi construído para o Portal, e o que
ainda depende de execução ou decisão.

## Status geral

| Peça | Situação |
|---|---|
| Cliente Supabase do Portal (`src/lib/supabase.ts`) | ✅ Pronto |
| Tabelas novas do Portal (`supabase/portal_cliente_setup.sql`) | ⏳ Escrita, **precisa ser rodada** |
| Autenticação de cliente + RLS por tenant (`supabase/portal_auth.sql`) | ⏳ Escrita, **precisa ser rodada e verificada** |
| Manuais técnicos | ✅ Ligado ao Supabase real (tabela `manuals`) |
| Comunicados ao cliente | ✅ Ligado ao Supabase real (`client_announcements`) |
| Isolamento por empresa na interface | ✅ Feito (recorte de exibição, não é barreira de segurança) |
| Permissão de papel (aprovar orçamento) | ✅ Na interface e no handler; a barreira real vem com a RLS |
| Chamados, Orçamentos, Peças, Máquinas com dado real | ⏸️ Depende de rodar `portal_auth.sql` |

## Ordem de execução

1. `supabase/portal_cliente_setup.sql` — cria as tabelas que não existiam.
2. `supabase/portal_auth.sql` — cria a autenticação de cliente e **corrige as
   policies frouxas** do arquivo anterior.

Rodar só o primeiro e parar deixa as tabelas do Portal com `USING (true)`, ou
seja, sem isolamento entre clientes. Os dois formam um par.

## Mapeamento de entidades

| Tipo do Portal (`src/types.ts`) | Fonte real | Observações |
|---|---|---|
| `Empresa` | `public.companies` (por CNPJ) | |
| `Usuario` | `public.contacts` + **nova** `public.portal_users` | `contacts` é o cadastro do funil de vendas e não tem login, papel nem senha. `portal_users` acrescenta a identidade de acesso, ancorada no contato. |
| `Maquina` | **Nova**: `public.client_machines` | O CRM não tinha cadastro de equipamento do cliente — só texto livre em `service_orders.equipamento`/`numero_serie`. |
| `Chamado` | `public.service_orders` | "OS" no CRM. Ver tradução de status abaixo. |
| `ChamadoMensagem` | **Nova**: `public.service_order_client_messages` | `service_notes` é interno (`visivel_vendedor`) e é espelhado em `contact_notes` por trigger — mensagem de cliente não deve entrar nesse fluxo. |
| `ChamadoAnexo` | **Nova**: `public.service_order_client_attachments` | Reaproveita o bucket `at-fotos`, que já existe. |
| `Orcamento` | `public.quotes` | Rascunho não é exposto ao cliente. |
| `Manual` | **Nova**: `public.manuals` (+ bucket `manuais`) | |
| `Peca` | `public.products` (`category = 'pecas'`) | |
| `Relatorio` | **Sem equivalente** | O mais próximo é `public.attachments` (PDFs de garantia). Não existe módulo de telemetria/eficiência no CRM — se isso for usado de verdade, é um módulo novo a desenhar. |
| `Atualizacao` | **Nova**: `public.client_announcements` | `announcements` existente é só para a equipe (`target_role` usa papéis internos). |
| `LogAtividade` | Sem equivalente — só local por enquanto | |

## Tradução de status

**Chamado → `service_orders.status`**

| Portal | CRM |
|---|---|
| Aberto | `aberto` |
| Em Atendimento | `em_andamento` |
| Aguardando Peça | `aguardando_peca` |
| *(sem equivalente)* | `aguardando_cliente` |
| Concluído | `resolvido` / `encerrado` |
| *(sem equivalente)* | `cancelado` |

`urgencia` (`Normal`/`Urgente`) não bate 1:1 com `prioridade`
(`baixa`/`normal`/`alta`/`critica`): sugestão é `Normal` → `normal` e
`Urgente` → `alta`, deixando `baixa`/`critica` como uso interno do CRM.

**Orçamento → `quotes.status`**

| Portal | CRM |
|---|---|
| Pendente | `enviado` |
| Aprovado | `aprovado` |
| Recusado | `rejeitado` |
| *(não exibido ao cliente)* | `rascunho`, `expirado` |

## Autenticação de cliente

### Por que não usa o Supabase Auth

Existe um trigger em `auth.users` (`restrict_google_auth_domain`, em
`supabase_google_auth_restriction.sql` no repo do CRM) que **apaga qualquer
usuário recém-criado cujo e-mail não termine em `@feramaq.com.br`**, em
qualquer INSERT — não só no login Google, apesar do comentário no código dizer
que deveria ser só Google. Cadastrar cliente pelo fluxo padrão do Supabase Auth
faria a conta ser apagada segundos depois.

Corrigir esse trigger seria o caminho mais simples e mais padrão, mas isso
altera o comportamento de autenticação de um sistema em produção. Como a
orientação foi não mexer em nada que já existe, `portal_auth.sql` constrói uma
identidade paralela, só para clientes, **sem encostar em `auth.users`**.

### Como funciona

- `portal_users` (ancorada em `contacts`) guarda e-mail, série de login, papel
  e senha com hash bcrypt via pgcrypto. `portal_sessions` guarda os tokens.
- Ambas ficam com RLS ligada e **sem nenhuma policy** — RLS ligada sem policy
  nega tudo, então hash de senha e token não são legíveis pela chave anônima.
  O acesso é exclusivamente pelas funções `SECURITY DEFINER`.
- **Leitura** usa RLS: o Portal envia o token no header `x-portal-token` e as
  policies resolvem esse token para um `contact_id`.
- **Escrita** usa funções `SECURITY DEFINER` que revalidam sessão e papel no
  banco. `portal_decidir_orcamento` recusa quem não é `cliente_admin` — é ali
  que a permissão vale, não no botão escondido da interface.

### O que precisa ser verificado ao rodar

Não consegui testar nada disso: o sandbox onde trabalho não alcança
`supabase.co` (bloqueio de rede da organização). O bloco de verificação no fim
de `portal_auth.sql` tem os comandos. O ponto mais incerto é o **item 4**: se o
PostgREST repassa mesmo o header `x-portal-token` para `request.headers`. Se
não repassar, a leitura precisa migrar para funções RPC, que não dependem
disso — é uma troca localizada, mas precisa ser feita.

### A parte que toca no CRM

A Parte 6 de `portal_auth.sql` é a única que mexe em tabela pré-existente, e
apenas com `CREATE POLICY ... FOR SELECT` em `contacts`, `companies`,
`service_orders`, `quotes` e `products`. Nenhuma policy existente é alterada ou
removida, nenhuma coluna muda, nenhum dado é tocado — policies permissivas se
somam com OR, então o acesso atual da equipe continua idêntico. Sem essa parte,
porém, o Portal não consegue ler nada do CRM, porque toda tabela de lá exige
`auth.uid()`, que o cliente do Portal nunca terá.

Dá para rodar as Partes 1–5 e deixar a 6 para revisar com o time: o Portal
segue funcionando com os dados mockados até lá.

## Isolamento entre clientes

Todo tipo do Portal carrega `empresa_id`, mas nenhuma tela filtrava por ele —
`Maquinas`, `Chamados`, `Orcamentos` e `Relatorios` renderizavam a lista
inteira que recebiam. Com dado real, um cliente enxergaria os equipamentos,
chamados e orçamentos de outro.

O recorte agora acontece em `App.tsx`: as máquinas são a âncora do tenant, e
chamados, orçamentos e relatórios pertencem ao cliente através da máquina que
referenciam. O mock inclui uma máquina, um chamado e um orçamento de uma
segunda empresa (`emp-2`) justamente para que isso seja verificável.

**Isso é recorte de exibição, não barreira de segurança.** Qualquer filtro no
front é contornável. A garantia de verdade são as policies de `portal_auth.sql`.

## Próximo passo

Depois de rodar as duas migrations e confirmar a verificação, o passo seguinte
é trocar o login mockado de `src/components/Auth.tsx` (que hoje aceita qualquer
senha com 4+ caracteres) pelas chamadas a `portal_login`, e migrar
Chamados/Orçamentos/Máquinas/Peças dos mocks para as consultas reais. Isso não
foi feito ainda de propósito: o front dependeria de um schema que ainda não foi
executado nem validado.
