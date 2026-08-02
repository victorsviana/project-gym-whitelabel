# ARCHITECTURE.md — arquitetura

## Princípio central

Uma regra de negócio, três aplicações. Tudo que é cálculo, tipo ou contrato mora em `shared/core`, em TypeScript puro. Web, API e mobile são apenas superfícies diferentes sobre o mesmo núcleo.

O corolário prático: **as telas nunca falam com a persistência diretamente**. Elas falam com repositórios cuja interface está em `@gym/core`. Na Fase 1 esses repositórios são implementados sobre `localStorage`; na Fase 2, sobre HTTP. A migração não deve alterar nenhum componente.

```
┌───────────────────────────────────────────────────────┐
│  apps/web · apps/mobile          (UI, rotas, estado)  │
└───────────────────┬───────────────────────────────────┘
                    │  usa interfaces
┌───────────────────▼───────────────────────────────────┐
│  shared/core   tipos · regras puras · contratos       │
└───────────────────▲───────────────────────────────────┘
                    │  implementa interfaces
┌───────────────────┴───────────────────────────────────┐
│  storage/localStorage (F1)  ·  cliente HTTP (F2)      │
└───────────────────────────────────────────────────────┘
```

## Monorepo

npm workspaces, sem ferramenta extra de build orchestration por enquanto (avaliar Turborepo se o tempo de CI incomodar).

```
package.json          workspaces: apps/*, shared/*
apps/
  web/      @gym/web       React + Vite + Tailwind + PWA      (Fase 1)
  api/      @gym/api       NestJS + Prisma + PostgreSQL       (Fase 2)
  mobile/   @gym/mobile    React Native + Expo                (Fase 3)
shared/
  core/     @gym/core      TypeScript puro
docs/
prototype/                 referência congelada, fora do build
```

Dependências entre workspaces se declaram normalmente: `"@gym/core": "*"` no `package.json` de quem consome.

## `shared/core`

```
src/
  types/          entidades, enums, tipos utilitários
  domain/         funções puras de cálculo e regra
  repositories/   interfaces de acesso a dado
  theme/          contrato do tema whitelabel e presets
  seed/           dados de demonstração
  utils/          datas em ISO, ids, formatação
  index.ts
```

**Restrições, sem exceção:**

- Nada de React, JSX ou hooks
- Nada de `window`, `document`, `localStorage`, `fetch`, `Date.now()` implícito em regra (a data entra por parâmetro, para o cálculo ser testável)
- Nada de I/O — o núcleo recebe dados e devolve dados

Se uma função precisa de qualquer coisa acima, ela não pertence ao núcleo.

## Camadas em `apps/web`

```
src/
  app/            entrada, rotas, providers, guards por papel
  ui/             design system, sem conhecimento de domínio
  theme/          aplica o tema da academia em runtime
  storage/        adapters localStorage (implementam @gym/core/repositories)
  features/
    auth/         seletor de perfil, login e cadastro
    student/      onboarding, home, treino, dieta, perfil
    gym/          alunos, treinos, atribuição, avisos, marca
  notifications/  agendamento local no Service Worker
```

**Regra de dependência:** `features` pode importar `ui`, `storage`, `theme` e `@gym/core`. `ui` não importa `features` nem `@gym/core/domain`. `storage` não importa nada de React.

### Estado

Três naturezas distintas, tratadas de forma distinta:

| Natureza | Onde vive | Exemplo |
|---|---|---|
| **Dado persistido** | repositórios + cache em store Zustand | treinos, refeições, cargas |
| **Sessão** | store Zustand persistida | usuário logado, papel, academia ativa |
| **Efêmero de tela** | `useState` local | passo do onboarding, modal aberto, rascunho de formulário |

Nada de um store global gigante espelhando o `localStorage` — foi exatamente o que tornou o protótipo difícil de evoluir.

### Cronômetros

Timers de sessão e de descanso são calculados a partir de um **timestamp de início**, não incrementados a cada tique. Um `setInterval` de 1 s serve só para redesenhar. Assim o tempo continua correto quando a aba fica em segundo plano ou o celular bloqueia (defeito #8 da [auditoria](PROTOTYPE-AUDIT.md)).

## Repositórios

Interfaces em `@gym/core/repositories`, uma por agregado:

```
GymRepository          academias e tema
UserRepository         contas e sessão
StudentRepository      perfil, avaliação e metas
WorkoutRepository      planos, exercícios e atribuições
ExecutionRepository    séries marcadas e cargas
NutritionRepository    refeições e água
ActivityRepository     dias ativos e sequência
NoticeRepository       pendências do painel
```

Todo método recebe o escopo de tenant explicitamente — não existe "academia atual" implícita dentro do repositório. Quem sabe qual é a academia é a camada de sessão.

```ts
interface WorkoutRepository {
  listPlans(gymId: string): Promise<WorkoutPlan[]>;
  listPlansForStudent(gymId: string, studentId: string): Promise<WorkoutPlan[]>;
  savePlan(gymId: string, plan: WorkoutPlan): Promise<void>;
  assign(gymId: string, planId: string, studentIds: string[]): Promise<void>;
}
```

Os métodos são assíncronos mesmo na Fase 1, onde `localStorage` é síncrono. Isso evita reescrever todas as chamadas quando a Fase 2 chegar.

## Persistência na Fase 1

Chave raiz `gymapp:v1` no `localStorage`, com um envelope versionado:

```json
{ "version": 1, "data": { "gyms": [], "users": [], "plans": [] } }
```

A leitura passa por uma rotina de migração que compara a versão gravada com a versão atual do código e aplica as migrações em ordem. Formato e entidades em [`DATA-MODEL.md`](DATA-MODEL.md).

## Multi-tenancy

Toda entidade carrega `gymId`; as do aluno carregam também `studentId`. Nenhuma consulta acontece sem escopo. Detalhes de papéis e visibilidade em [`MULTI-TENANCY.md`](MULTI-TENANCY.md).

## Tema whitelabel

As cores da academia viram CSS custom properties em `:root` e os tokens do Tailwind apontam para essas variáveis, de modo que trocar de academia repinta o app sem rebuild. Contrato e mecânica em [`WHITELABEL.md`](WHITELABEL.md).

## PWA

- `vite-plugin-pwa` com Workbox; precache do shell e das fontes
- Estratégia offline-first: na Fase 1 não há rede a considerar; na Fase 2, cache-first para dados de leitura e fila de escrita para sincronizar
- Manifest gerado em runtime com nome, ícone e cores da academia ativa
- Notificações locais agendadas pelo Service Worker (Fase 1) e substituídas por Web Push (Fase 2)

## Testes

| Camada | Ferramenta | O que cobre |
|---|---|---|
| Domínio (`@gym/core`) | Vitest | Todas as fórmulas, com os casos de [`DOMAIN-RULES.md`](DOMAIN-RULES.md). Cobertura alta — é código puro, barato de testar |
| Repositórios | Vitest | Migração de schema, isolamento por tenant |
| Componentes | Testing Library | Fluxos críticos: onboarding, marcar série, registrar refeição, montar e atribuir treino |
| Integração | Testing Library | O fluxo professor cria treino → aluno vê treino, ponta a ponta na mesma sessão |

## Evolução por fase

| | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|
| Persistência | `localStorage` | PostgreSQL via API | API + SQLite offline |
| Autenticação | mockada, sessão local | JWT real | JWT real |
| Notificações | locais no Service Worker | Web Push | push nativo |
| Tema | definido no painel, salvo local | servido pela API | idem, embarcado ou remoto |
| `@gym/core` | tipos, domínio, contratos | + cliente gerado do OpenAPI | reaproveitado integralmente |

O que **não** muda entre as fases: as fórmulas de domínio, os tipos das entidades e as interfaces de repositório. Essa estabilidade é o objetivo da arquitetura.
