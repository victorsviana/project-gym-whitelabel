# ADR-0005 — NestJS + Prisma + PostgreSQL na Fase 2

**Data:** 01/08/2026 · **Status:** Aceita

## Contexto

A Fase 2 troca o `localStorage` por servidor real. O que ela precisa suportar: multi-tenancy com isolamento garantido, quatro papéis com permissões distintas, autenticação com refresh, Web Push agendado, importação dos dados da Fase 1 e uma API que também servirá o app nativo da Fase 3.

Some-se a isso que os dados são de saúde — treino, peso, alimentação — o que traz obrigações de LGPD desde o primeiro dia: consentimento, exportação e exclusão de conta.

## Decisão

**NestJS + Prisma + PostgreSQL**, com JWT (access + refresh), RBAC por papel, `gym_id` em toda tabela e Row Level Security como segunda barreira. Contrato exposto em OpenAPI, do qual se gera o cliente TypeScript publicado em `@gym/core`.

## Alternativas consideradas

**Supabase.** Chegaria a produção bem mais rápido: Postgres, autenticação, storage e realtime prontos, com multi-tenancy por Row Level Security. Foi a alternativa mais forte. Recusada porque este é um produto vendido a várias academias, com regra de autorização que vai além de "o usuário é dono da linha" — professor edita aluno, distribuidor atravessa tenants, publicação de treino tem efeito colateral. Espremer isso em políticas RLS funciona no começo e vira difícil de auditar depois. E amarra a espinha dorsal do produto a um fornecedor.

Vale registrar que a recusa não é técnica, é de dependência: se a prioridade mudar para "chegar ao mercado o mais rápido possível", Supabase é a escolha certa e esta ADR deve ser revista.

**Fastify + Drizzle.** Mais leve e rápido, com menos abstração. Recusado por oferecer menos estrutura pronta justamente onde ela vale mais: injeção de dependência, guards e módulos são exatamente o que organiza RBAC e escopo de tenant. Com um desenvolvedor, convenção vale mais que flexibilidade.

**Express puro.** Liberdade total e nenhuma estrutura. Todo projeto assim acaba inventando uma versão pior do NestJS.

**Manter tudo no cliente, sincronizando via CRDT.** Interessante no papel, desproporcional ao problema: o professor precisa ver o aluno em tempo real, e há dado que não pode viver só no dispositivo.

## Consequências

**Bom:** estrutura clara para RBAC e escopo de tenant; Prisma dá migrations versionadas e tipos gerados que conversam com `@gym/core`; OpenAPI gera o cliente consumido por web e mobile; controle total sobre autorização e retenção de dados, que é requisito de LGPD.

**Ruim:** muito mais código para escrever que um BaaS; autenticação, storage de arquivos, e-mail transacional e agendamento passam a ser nossa responsabilidade; infraestrutura para manter — banco, backup, monitoramento.

**Restrição que já vale hoje:** os contratos de repositório definidos em `@gym/core` na Fase 1 são a especificação desta API. Ela precisa satisfazê-los exatamente, para que trocar o adapter de `localStorage` por HTTP não exija tocar em nenhuma tela. Se durante a Fase 2 um contrato se mostrar inadequado, ele muda nos dois lados ao mesmo tempo — é a vantagem do monorepo.
