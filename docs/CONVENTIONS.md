# CONVENTIONS.md — convenções

## Idioma

**Código em inglês, interface em português do Brasil.** Sem exceção e sem mistura.

```ts
// certo
function computeDailyGoals(profile: StudentProfile): DailyGoal
<Button>Iniciar treino</Button>

// errado
function calcularMetas(perfil: PerfilAluno): MetaDiaria
```

Comentários e documentação em português — são lidos por quem trabalha no projeto, não pelo compilador. Nomes de domínio que não têm tradução boa ficam em inglês mesmo (`streak`, `set`, `plan`).

## Nomenclatura

| Item | Padrão | Exemplo |
|---|---|---|
| Componente | `PascalCase` | `WorkoutCard.tsx` |
| Hook | `camelCase` com prefixo `use` | `useActiveGym.ts` |
| Função e variável | `camelCase` | `computeStreak` |
| Tipo e interface | `PascalCase`, sem prefixo `I` | `WorkoutPlan` |
| Constante | `SCREAMING_SNAKE_CASE` | `WATER_CUP_ML` |
| Arquivo de domínio e util | `kebab-case` | `daily-goals.ts` |
| Pasta | `kebab-case`, singular | `features/student/` |

Nada de números mágicos: `250` vira `WATER_CUP_ML`, `2.5` vira `LOAD_STEP_KG`.

## TypeScript

- `strict: true`, sem exceção
- **`any` é proibido.** Se o tipo é desconhecido, use `unknown` e estreite
- Sem `as` para calar o compilador — se precisou, o tipo está errado
- Prefira uniões literais a `enum`: `type Role = 'student' | 'trainer'`
- Todo tipo de entidade vem de `@gym/core/types`; não redeclare tipo de domínio dentro de uma app

## Estrutura de componente

```
features/student/workout/
  WorkoutList.tsx        componente
  WorkoutList.test.tsx   teste ao lado
  use-workout-list.ts    lógica de tela, se crescer
```

Regras:

- Um componente por arquivo, exportação nomeada
- Componente não calcula regra de negócio — chama `@gym/core`
- Componente não acessa `localStorage` — chama um repositório
- Componente de `ui/` não conhece domínio: recebe dados prontos e emite callbacks

## Estilo

Tailwind, sempre. Sem CSS Modules, sem styled-components, sem `style` inline (salvo valor calculado em runtime, como a largura de uma barra de progresso).

- Cor de marca só pelos tokens: `bg-brand`, `text-brand-fg`, `bg-brand/10`
- **Nunca** `bg-[#E4022E]` nem cor de paleta do Tailwind para marca
- Classes longas: extraia um componente, não uma string de classe
- Ordem das classes pelo plugin de ordenação do Prettier

## Testes

| O quê | Onde | Quanto |
|---|---|---|
| Regras de domínio | `shared/core/src/domain/*.test.ts` | Todas as fórmulas, com os casos de [`DOMAIN-RULES.md`](DOMAIN-RULES.md) |
| Repositórios | `apps/web/src/storage/*.test.ts` | Migração de schema e isolamento por tenant |
| Componentes | ao lado do componente | Fluxos críticos, não cobertura por cobertura |
| Integração | `apps/web/src/__tests__/` | Professor cria treino → aluno vê treino |

Escreva o teste que falharia com o bug. Teste que passa nos dois cenários não testa nada.

Todo defeito de [`PROTOTYPE-AUDIT.md`](PROTOTYPE-AUDIT.md) precisa de um teste que reprovaria o comportamento antigo.

## Git

**Branches:** `feat/f1-e14-atribuicao-de-treino`, `fix/streak-conta-dia-inativo`, `docs/roadmap-fase-2`

**Commits** em inglês, no imperativo, com o épico quando houver:

```
feat(f1-e14): assign workout plans to students
fix(domain): use ISO date keys so history sorts correctly
docs: add multi-tenancy isolation tests
```

Um commit, uma ideia. Formatação em massa vai em commit separado.

**Pull requests:** descreva o que muda e por quê, cite o épico, e se mexeu em interface, anexe captura nas três marcas de demonstração.

## Acessibilidade

Não é etapa final; é requisito de aceite de cada épico.

- Todo controle alcançável por teclado, com foco visível
- Ícone sem texto precisa de `aria-label`
- Alvo de toque de no mínimo 44 px
- Contraste AA, inclusive nas cores de marca configuráveis (ver [`WHITELABEL.md`](WHITELABEL.md))
- `prefers-reduced-motion` respeitado
- Estados de erro anunciados, não apenas coloridos de vermelho

## Formatação de dados na interface

| Dado | Formato |
|---|---|
| Peso e carga | `78 kg`, `22,5 kg` — vírgula decimal |
| Água | `3,2L` |
| Calorias | `2.847 kcal` — ponto de milhar |
| Data curta | `1 ago` |
| Data longa | `Segunda, 1 ago` |
| Duração | `55 min` |
| Cronômetro | `04:32`, sempre com tabular nums |

Datas de negócio circulam internamente em ISO `YYYY-MM-DD` e só viram texto na renderização.

## Dependências

- Instale sempre no workspace certo: `npm install <pkg> -w @gym/web`
- **npm**, nunca pnpm nem yarn — o `package-lock.json` é o arquivo de verdade
- Antes de adicionar uma biblioteca, pergunte se 30 linhas resolvem. Cada dependência é peso no bundle e superfície de manutenção
- `@gym/core` não tem dependência de runtime. Se precisou de uma, provavelmente não é código de domínio

## O que não fazer

- Regra de negócio dentro de componente
- `localStorage` fora de `apps/web/src/storage/`
- Consulta sem filtro de `gymId`
- Cor literal em componente
- `any`, `@ts-ignore`, `eslint-disable` sem comentário justificando
- Editar `prototype/` — é referência congelada; para regenerar, rode `node prototype/unpack.mjs`
- Terminar a sessão sem atualizar [`STATE.md`](STATE.md)
