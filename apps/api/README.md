# @gym/api — API (Fase 2)

API REST multi-tenant que substitui o `localStorage` da Fase 1.

**Status:** não iniciado. Começa depois que a Fase 1 fechar — ver [`../../docs/ROADMAP.md`](../../docs/ROADMAP.md).

## Stack planejada

NestJS · Prisma · PostgreSQL · JWT (access + refresh) · Web Push (VAPID) · OpenAPI

## Escopo

- Multi-tenancy por `gym_id`, com RBAC: `aluno` · `professor` · `admin_academia` · `distribuidor`
- Entidades da Fase 1 promovidas a tabelas (ver [`../../docs/DATA-MODEL.md`](../../docs/DATA-MODEL.md))
- Importação do `localStorage` da Fase 1 para a conta, no primeiro login
- Web Push real com agendamento no servidor, substituindo as notificações locais
- Branding servido pela API (logo em object storage, subdomínio por academia)
- Cliente TypeScript gerado do OpenAPI e publicado em `@gym/core`, consumido por web e mobile
- LGPD: dados de treino e alimentação são dados de saúde — consentimento, exportação e exclusão de conta

## Regra que já vale hoje

A Fase 1 define os contratos de repositório em `@gym/core`. Esta API precisa satisfazer exatamente esses contratos, para que trocar o adapter de `localStorage` por HTTP não exija mexer em nenhuma tela.
