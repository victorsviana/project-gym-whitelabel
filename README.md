# Gym Whitelabel

App whitelabel para academias. Cada academia entrega aos seus alunos um app com a própria marca, onde o professor monta os treinos e o aluno acompanha treino, dieta e evolução.

**Dois perfis, um produto:**

- **Aluno** — avaliação inicial, metas de dieta calculadas, treino do dia, cronômetro e descanso, registro de séries e cargas com histórico, diário alimentar, hidratação, calendário de constância.
- **Academia / professor** — cadastro de alunos, montagem e atribuição de treinos, acompanhamento de pendências e configuração da identidade visual da marca.

## Status

**Fase 1 — em desenvolvimento.** Consulte [`docs/STATE.md`](docs/STATE.md) para o estado atual e [`docs/ROADMAP.md`](docs/ROADMAP.md) para o plano das três fases.

## Stack

| Fase | Entrega | Stack |
|---|---|---|
| 1 | PWA web, multi-tenant, offline, dados em `localStorage` | React 18 · TypeScript · Vite · Tailwind · Zustand · PWA |
| 2 | API e banco reais, autenticação, Web Push | NestJS · Prisma · PostgreSQL |
| 3 | App nativo iOS e Android | React Native · Expo |

## Estrutura

```
apps/web/       aplicação web (Fase 1)
apps/api/       API (Fase 2)
apps/mobile/    app nativo (Fase 3)
shared/core/    tipos, contratos e regras de negócio compartilhados
docs/           documentação do projeto
prototype/      protótipo original, congelado como referência
```

## Como rodar

Requer Node 20+. O gerenciador é **npm** com workspaces.

```bash
npm install
npm run dev      # sobe o app web
npm run test     # testes
```

Contas de teste (academias e alunos mockados) estão em [`docs/SEED-DATA.md`](docs/SEED-DATA.md).

## Documentação

Comece por [`AGENTS.md`](AGENTS.md) — é o índice de toda a documentação e o guia para qualquer pessoa ou IA que for trabalhar no projeto.
