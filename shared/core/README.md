# @gym/core — núcleo compartilhado

TypeScript puro, consumido pelas três apps. **Sem React, sem `window`, sem `localStorage`, sem `fetch`.** É o que garante que web, API e mobile não reimplementem a mesma regra de três formas diferentes.

**Status:** pacote criado com `package.json`, `tsconfig.json` e `src/index.ts` vazio — ainda sem tipos nem regras de domínio (entra na F1-E03). Estrutura alvo abaixo.

## O que mora aqui

```
src/
  types/          entidades e enums (Gym, User, WorkoutPlan, Meal, …)
  domain/         regras puras: metas, macros, água, streak, progressão de carga
  repositories/   contratos (interfaces) que cada app implementa do seu jeito
  theme/          contrato do tema whitelabel e presets de marca
  seed/           academias, professores e alunos de demonstração
  utils/          datas (ISO YYYY-MM-DD), formatação, ids
```

## O que **não** mora aqui

- Componentes, hooks ou qualquer coisa de React
- Implementação de persistência — só o contrato. O adapter `localStorage` fica em `apps/web/src/storage/`, o Prisma fica em `apps/api/`
- Chamadas de rede (na Fase 2 entra um cliente gerado do OpenAPI, ainda sem lógica de negócio)

## Por que contratos e não implementação

Na Fase 1 os repositórios são implementados sobre `localStorage`. Na Fase 2 a mesma interface é implementada sobre HTTP. Como as telas dependem apenas da interface, a migração não toca em nenhum componente. Esse é o principal motivo de `@gym/core` existir desde o primeiro dia.

Detalhes em [`../../docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md); as fórmulas normativas em [`../../docs/DOMAIN-RULES.md`](../../docs/DOMAIN-RULES.md).
