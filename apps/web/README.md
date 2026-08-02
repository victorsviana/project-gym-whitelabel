# @gym/web — aplicação web (Fase 1)

PWA multi-tenant com os dois perfis: **aluno** e **academia/professor**. Nesta fase todos os dados vivem em `localStorage`; não há servidor.

**Status:** ferramental pronto (F1-E01) — Vite, TS strict, ESLint, Prettier, Vitest + Testing Library e Tailwind configurados. Ainda sem telas nem `features/`; a estrutura abaixo é o alvo definido em [`../../docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

## Stack

React 18 · TypeScript strict · Vite · Tailwind · Zustand · React Router · `vite-plugin-pwa` (Workbox) · Vitest + Testing Library

## Estrutura alvo

```
src/
  app/            rotas, providers, guards por papel
  ui/             design system (Button, Card, Stepper, Chip, Sheet, Toggle, Ring, ProgressBar)
  theme/          aplicação do tema da academia em runtime (CSS vars)
  storage/        adapters localStorage que implementam os contratos de @gym/core
  features/
    auth/         seletor de perfil, login e cadastro mockados
    student/      onboarding, home, treino, dieta, perfil
    gym/          painel: alunos, treinos, atribuição, avisos, identidade visual
  notifications/  agendamento local no Service Worker
```

## Regras específicas desta app

- Nenhum cálculo de negócio aqui — tudo vem de `@gym/core` (ver [`../../docs/DOMAIN-RULES.md`](../../docs/DOMAIN-RULES.md)).
- Nenhum acesso direto a `localStorage` fora de `src/storage/`.
- Nenhuma cor literal: use os tokens do tema (ver [`../../docs/WHITELABEL.md`](../../docs/WHITELABEL.md)).
- Layout responsivo de verdade — a moldura de iPhone do protótipo não é portada.
