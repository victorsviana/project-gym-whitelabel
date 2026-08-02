# STATE.md — estado atual do projeto

> **Documento vivo.** Leia primeiro, atualize por último. É a fonte da verdade sobre onde o projeto está — não deduza o estado pelo código.

**Última atualização:** 01/08/2026
**Fase atual:** Fase 1 — PWA multi-tenant (ver [`ROADMAP.md`](ROADMAP.md))
**Épico atual:** F1-E04 concluído · próximo é F1-E05

---

## Onde estamos

O ferramental da Fase 1 está pronto, o design system também, `@gym/core` tem os tipos e as fórmulas de domínio, e agora também tem os contratos de repositório — com os adapters de `localStorage` implementados em `apps/web`. Falta popular esses adapters com os dados de demonstração completos (três academias) e então construir as telas de verdade.

O protótipo original (`prototype/Academia Whitelabel - Demo.html`) foi desempacotado, analisado por inteiro e traduzido em especificação: telas, fórmulas, modelo de dados e defeitos estão catalogados. O plano das três fases está fechado e as seis decisões de arquitetura estão registradas.

## ✅ Pronto

- Estrutura do monorepo: `apps/{web,api,mobile}`, `shared/core`, `docs/`, `prototype/`
- `package.json` de raiz com npm workspaces, `.gitignore`
- `AGENTS.md` + `CLAUDE.md` como ponto de entrada para agentes de IA
- Protótipo desempacotado em `prototype/extracted/` (markup, lógica e o scaffold de moldura que **não** será portado) e script `unpack.mjs` para regenerar
- Documentação completa: produto, roadmap, arquitetura, regras de domínio, modelo de dados, multi-tenancy, whitelabel, UI, tokens, auditoria do protótipo, dados de demonstração e convenções
- Seis ADRs registradas em `docs/decisions/`
- **F1-E01 · Monorepo e ferramental:**
  - `apps/web` criado com Vite + React 18 + TypeScript strict (`tsconfig.app.json`/`tsconfig.node.json` com `strict: true`), pinado em React 18 por causa da [ADR-0002](decisions/ADR-0002-stack-fase-1.md) (o scaffold do Vite hoje vem em React 19 por padrão)
  - `shared/core` criado como workspace `@gym/core` (`package.json`, `tsconfig.json`, `src/index.ts` vazio); `apps/web` já depende dele
  - ESLint 10 (flat config, `apps/web/eslint.config.js`) com `typescript-eslint`, `eslint-plugin-react-hooks` (usar `configs.flat['recommended-latest']`, não `configs['recommended-latest']` — o formato antigo quebra no ESLint 10) e `eslint-plugin-react-refresh`
  - Prettier com `prettier-plugin-tailwindcss` (`apps/web/.prettierrc.json`)
  - Vitest + Testing Library configurados no `vite.config.ts` (`environment: jsdom`, `setupFiles: src/test/setup.ts` importando `@testing-library/jest-dom/vitest`); `jsdom` fixado em `27.x` porque a `30.x` exige Node `^22.22.2` e o ambiente local tem `22.14.0`; teste de exemplo em `App.test.tsx`
  - Tailwind v4 instalado via `@tailwindcss/vite` (plugin no `vite.config.ts`, `@import 'tailwindcss';` em `index.css`) — só o básico; tokens de marca (cor via CSS vars) ficam para o F1-E02, conforme [ADR-0003](decisions/ADR-0003-tailwind-tema-runtime.md). Como o ADR foi escrito pensando em `tailwind.config` (estilo v3), o E02 precisa adaptar o exemplo para a sintaxe `@theme` da v4
  - `npm install`, `npm run dev`, `npm run typecheck`, `npm run test` e `npm run lint` passando em ambos os workspaces (`@gym/core` usa `--passWithNoTests` até o F1-E03 trazer domínio)
  - CI mínimo em `.github/workflows/ci.yml` (`npm ci && npm run lint && npm run typecheck && npm run test`, Node 22)
- **F1-E02 · Design system em Tailwind:**
  - `apps/web/src/styles/tokens.css`: `--brand`/`--brand-rgb`/`--brand-fg` (placeholder de demonstração até o F1-E07 escrever o tema real em runtime), tokens de sistema para tema escuro (padrão, em `:root`) e claro (em `:root[data-theme='light']`), e as seis cores semânticas — valores batendo com [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)
  - Tokens ligados ao Tailwind v4 via `@theme inline` (não `@theme` puro — como os valores são `var(--brand)` etc., referenciando custom properties definidas fora do bloco, o Tailwind precisa da variante `inline` para emitir `var(--color-*)` nas utilities em vez de resolver em build time; sem isso a troca de tema/marca em runtime não repinta). Radii customizados (`rounded-field`, `rounded-card`, `rounded-card-lg`, `rounded-sheet`, `rounded-icon`) também entraram no `@theme` para não depender de valor arbitrário espalhado pelos componentes
  - Fontes Barlow / Barlow Condensed via `@fontsource/barlow` e `@fontsource/barlow-condensed` (pesos 400/600/700 e 700/800) — self-hosted pelo bundler, sem CDN; os `.woff2` do protótipo original não foram recuperáveis pelo `unpack.mjs` (só extrai markup/lógica, não assets binários)
  - 11 componentes em `apps/web/src/ui/`: `Button`, `Card`, `Chip`, `Stepper`, `Toggle`, `Sheet`, `ProgressBar`, `Ring`, `SegmentedControl`, `EmptyState`, `Toast` — todos só com CSS vars/tokens, nenhuma cor literal
  - Testes ao lado dos componentes com lógica de interação (`Stepper`, `Toggle`, `SegmentedControl`, `Sheet`); os puramente apresentacionais ficaram sem teste dedicado, por [`CONVENTIONS.md`](CONVENTIONS.md) ("não cobertura por cobertura")
  - Página de showcase (`apps/web/src/showcase/Showcase.tsx`, montada em `App.tsx`) com seletor de tema claro/escuro e um trocador das três marcas de demonstração ([`WHITELABEL.md`](WHITELABEL.md#marcas-de-demonstração)) escrevendo as CSS vars direto no `documentElement` — prova visual de que o ADR-0003 funciona, mesmo sem a tela real de identidade visual (F1-E07)
  - Corrigido `apps/web/src/test/setup.ts`: faltava `afterEach(() => cleanup())` — sem `test.globals` no `vite.config.ts`, o Testing Library não faz cleanup automático entre testes e componentes de um teste vazavam pro DOM do próximo
  - `npm run lint`, `typecheck`, `test` e `build` passam limpos; servidor de dev sobe e responde 200. Não foi possível confirmar visualmente em navegador nesta sessão — sem ferramenta de screenshot/browser disponível no ambiente
- **F1-E03 · Domínio em `@gym/core`:**
  - `shared/core/src/types/`: um arquivo por entidade de [`DATA-MODEL.md`](DATA-MODEL.md) (`Gym`/`GymTheme`, `User`, `StudentProfile`, `DailyGoal`, `WorkoutPlan`/`PlanExercise`, `Assignment`, `SetLog`, `LoadLog`, `Meal`, `Food`, `WaterLog`, `ActivityDay`, `Notice`, `Session`) mais `common.ts` com as uniões literais (`Sex`, `Goal`, `Level`, `BodyRegion`, `Restriction`, `Role`, `MealType`, `MealSource`, `GoalSource`, `NoticeKind`) — nenhum `enum`, conforme [`CONVENTIONS.md`](CONVENTIONS.md)
  - `shared/core/src/dates/iso-date.ts`: `IsoDate` (`YYYY-MM-DD`), `todayIsoDate`, `toIsoDate`, `isValidIsoDate`, `addDays`, `compareIsoDate`, `isSameMonth` — tudo comparação de string, sem `Date` cruzando fuso
  - `shared/core/src/domain/`: uma função (ou pequeno grupo) por seção de [`DOMAIN-RULES.md`](DOMAIN-RULES.md) — `daily-goals.ts` (TMB Mifflin-St Jeor, TDEE, kcal-alvo, macros, meta de água — `computeDailyGoal`), `nutrition.ts` (consumo do dia, macros de alimento por 100g), `hydration.ts` (copos de 250 ml), `streak.ts` (dia ativo, sequência, dias ativos no mês), `workout-progress.ts` (progresso de séries), `load.ts` (ajuste ±2,5 kg, delta de carga), `schedule.ts` (treino do dia por peso da semana, sugestão de refeição por horário), `adapted-exercise.ts` (selo Adaptado)
  - Os quatro casos de teste de referência de `DOMAIN-RULES.md §1.8` (`computeDailyGoal`) passam exatamente como especificado — foi o ponto mais delicado, por causa da ordem de arredondamento (carboidrato precisa da proteína e gordura já arredondadas, não dos valores brutos)
  - `@gym/core` segue sem nenhuma dependência de runtime: só tipos e funções puras, nada de `Date` cruzando fuso horário além do necessário para `getWeekdayIndex`/`addDays` (que usam componentes locais, não UTC)
  - 59 testes novos em `shared/core`, todos ao lado do código testado; `npm run typecheck`, `npm run test` e `npm run lint` (na raiz, cobrindo os dois workspaces) passam limpos
  - Bug pego na primeira escrita do teste de `load.ts`: `increaseLoad(20.3)` não dá `22.5`, dá `23` (22,8 está mais perto de 23 que de 22,5) — o teste é que estava errado, não o código; corrigido antes de seguir
- **F1-E04 · Repositórios e persistência:**
  - `shared/core/src/repositories/`: uma interface por agregado, seguindo o agrupamento de [`ARCHITECTURE.md`](ARCHITECTURE.md#repositórios) — `GymRepository`, `UserRepository` (contas + sessão), `StudentRepository` (perfil + metas), `WorkoutRepository` (planos + atribuições), `ExecutionRepository` (séries + cargas), `NutritionRepository` (refeições + água + base de alimentos), `ActivityRepository`, `NoticeRepository`. Só assinatura — nenhuma dessas interfaces importa nada de `apps/web`
  - `shared/core/src/ids.ts`: `createId()` — gerador simples baseado em `Math.random`, não UUID; escolhido porque `crypto.randomUUID` exige lib `DOM`/`node`, que `@gym/core` não tem (é TypeScript puro, sem dependência de runtime, ver regra em `ARCHITECTURE.md`)
  - `apps/web/src/storage/schema.ts`: `StorageData` (as 13 coleções planas) e o envelope `{ version, updatedAt, data }`, batendo com o formato de [`DATA-MODEL.md`](DATA-MODEL.md#armazenamento-na-fase-1--localstorage)
  - `apps/web/src/storage/migrations.ts`: `migrate(data, fromVersion)` pura, com o registro de migrações injetável por parâmetro — hoje vazio (schema ainda na v1), mas testável sem esperar a próxima mudança real
  - `apps/web/src/storage/store.ts` (chave `gymapp:v1`) e `session-store.ts` (chave `gymapp:session`, separada de propósito — limpar dados de demo não derruba o login); `store.ts` avisa no console e preserva os dados quando a versão salva é mais nova que a do código, em vez de apagar
  - Um arquivo por repositório em `apps/web/src/storage/`, cada um implementando a interface correspondente de `@gym/core` só com leitura/escrita do envelope inteiro (dataset pequeno, sem necessidade de índice); `index.ts` exporta as factories e uma instância única de cada repositório para as telas consumirem
  - `apps/web/src/storage/seed.ts`: `seedIfEmpty()` cria só uma academia e um professor mínimos, idempotente — o seed completo com as três academias de [`SEED-DATA.md`](SEED-DATA.md) é o F1-E05, então evitei antecipar contas/ids que aquele épico vai criar de verdade
  - 33 testes novos em `apps/web/src/storage/` (+ 2 em `@gym/core/ids`): migração pura, versão mais nova que o código, round-trip do envelope, sessão em chave separada, e isolamento por tenant nos casos que `MULTI-TENANCY.md` marca como obrigatórios — e-mail repetido em duas academias (caso Camila Reis), listagem de planos e de usuários nunca vazando entre academias, atribuição/desatribuição de treino sem apagar histórico
  - `npm run lint`, `typecheck`, `test` e `build` (na raiz, cobrindo os dois workspaces) passam limpos; confirmado por `grep` que `localStorage` só aparece dentro de `apps/web/src/storage/`

## 🔜 Próxima tarefa

**F1-E05 · Dados de demonstração multi-tenant.** Ver detalhes em [`ROADMAP.md`](ROADMAP.md#épicos) e as contas exatas em [`SEED-DATA.md`](SEED-DATA.md):

1. Substituir `seedIfEmpty()` (hoje em `apps/web/src/storage/seed.ts`, só uma academia e um professor placeholder) pelo seed completo: três academias (Gaviões Fitness, Bluefit, Iron House) com professor, alunos, planos, atribuições e histórico, usando os repositórios já prontos do F1-E04 — não deve ser necessário mexer em nenhuma interface de `@gym/core`
2. Reproduzir exatamente os perfis e metas da tabela de [`SEED-DATA.md`](SEED-DATA.md#metas-esperadas) (batem com os casos de `DOMAIN-RULES.md`) para servir de conferência visual do cálculo
3. Gerar histórico com forma (cargas crescentes, dias ativos concentrados em dias úteis, refeições em torno da meta, água entre 60–100 %) com semente determinística — dois devs rodando o seed veem os mesmos números
4. Caso especial: Camila Reis com o mesmo e-mail em Gaviões e Iron House, como duas contas independentes (já coberto por teste de isolamento no F1-E04, mas o seed real precisa reproduzir)
5. Ação de "restaurar dados de demonstração" (limpa e recria tudo)

*Aceite:* as contas de `SEED-DATA.md` existem e entram no app; os históricos são plausíveis.

Depois dela, seguir a ordem sugerida em [`ROADMAP.md`](ROADMAP.md#ordem-sugerida): `E06 → E07`, e só então `E13 → E14` antes das telas do aluno.

## 🚧 Em andamento

Nada.

## ⛔ Bloqueios

Nenhum.

## Decisões pendentes

Não bloqueiam a Fase 1, mas precisam de resposta antes das fases indicadas. A lista completa, com impacto, está em [`PROJECT.md`](PROJECT.md#questões-em-aberto).

| Questão | Quando |
|---|---|
| Quem cadastra o aluno na prática | Fase 1 — **assumido**: o professor cadastra e o aluno também pode se cadastrar escolhendo a academia |
| Modelo de cobrança | Fase 2 |
| Integração com ERP de academia | Fase 2 |
| Registro por áudio vira IA real? | Fase 2 |
| Whitelabel nativo: binário por academia ou app único? | Fase 3 |

## Log de sessões

### 01/08/2026 — Análise do protótipo e fundação documental
Desempacotei o bundle de artifact (1,5 MB, gzip + base64 dentro do manifesto) e analisei o app inteiro: 877 linhas de markup e 444 de lógica. Levantei todas as telas, as fórmulas de cálculo de metas e 10 defeitos.

Definimos que a Fase 1 vai além do protótipo: nasce **multi-tenant** com os dois perfis (aluno e academia/professor) funcionando de verdade em `localStorage`, com o professor montando e atribuindo treinos que o aluno vê. A moldura de iPhone do protótipo foi descartada — o app é responsivo de verdade. Estilo com Tailwind, monorepo npm com `apps/{web,api,mobile}` e `shared/core`.

Organizei o repositório e escrevi toda a documentação. Nenhuma linha de app foi escrita — por decisão, a Fase 1 começa na próxima sessão.

### 01/08/2026 — F1-E01: monorepo e ferramental

Executei o épico F1-E01 por completo. `apps/web` nasceu do template `react-ts` do Vite, mesclado à mão para preservar o `README.md` que já existia ali; removi o conteúdo de demonstração (App.tsx, CSS, assets, ícones da Vite) e deixei um placeholder mínimo. `shared/core` virou workspace real (`@gym/core`), ainda vazio de domínio — isso é o F1-E03.

Duas decisões que vale registrar: fixei React em `18.x` porque o scaffold atual do Vite vem em React 19 por padrão e a ADR-0002 fecha em React 18; e fixei `jsdom` em `27.x` porque a versão mais nova (`30.x`) exige Node `22.22.2+` e o ambiente local está em `22.14.0`. Também tive que trocar `reactHooks.configs['recommended-latest']` por `reactHooks.configs.flat['recommended-latest']` no ESLint flat config — o pacote mudou de formato e a raiz antiga quebra no ESLint 10.

Tailwind entrou (v4, via `@tailwindcss/vite`) só na configuração básica, sem tokens — isso é o F1-E02. Como a ADR-0003 documenta o exemplo de cor com sintaxe de `tailwind.config` (v3), quem for implementar os tokens no E02 vai precisar adaptar para `@theme` (v4).

Todos os critérios de aceite do épico batem: `npm install`, `npm run dev`, `npm run typecheck`, `npm run test` e `npm run lint` passam limpos nos dois workspaces, e o CI mínimo está em `.github/workflows/ci.yml`. Nada foi commitado — os arquivos ficaram como *untracked*/modificados no working tree.

### 01/08/2026 — F1-E02: design system em Tailwind

Executei o épico F1-E02 por completo. O ponto mais delicado foi ligar os tokens ao Tailwind v4: como a cor de marca precisa mudar em runtime (é o requisito central do ADR-0003), os valores no bloco `@theme` não podem ser literais — precisam apontar para as custom properties escritas em `:root`. Isso exige `@theme inline` em vez de `@theme` puro; com o bloco normal o Tailwind resolve o valor em build time e a troca de marca para de funcionar.

Os `.woff2` do protótipo, apesar do que o `DESIGN-TOKENS.md` sugeria, não estavam de fato recuperáveis: o `unpack.mjs` só extrai markup e lógica do bundle, não assets binários. Resolvi com `@fontsource/barlow` e `@fontsource/barlow-condensed` — continuam self-hosted pelo bundler, sem CDN, só que via npm em vez de copiados do protótipo.

Os 11 componentes pedidos pelo épico foram criados em `apps/web/src/ui/`, todos usando só tokens (nenhum `bg-[#...]`, nenhuma cor de paleta Tailwind para marca). Escrevi teste para os que têm lógica de interação de verdade (`Stepper`, `Toggle`, `SegmentedControl`, `Sheet`) e não para os puramente apresentacionais, seguindo a orientação de `CONVENTIONS.md` de não cobrir por cobrir. Nesse processo encontrei um bug real no `test/setup.ts`: sem `test.globals: true` no `vite.config.ts`, o Testing Library não registra cleanup automático entre testes, e componentes de um teste vazavam para o próximo (dois `Toggle` com o mesmo `aria-label` no DOM ao mesmo tempo). Corrigido com `afterEach(() => cleanup())` explícito.

A página de showcase (`apps/web/src/showcase/Showcase.tsx`, montada em `App.tsx` no lugar do placeholder) além de renderizar os componentes nos dois temas, tem um trocador das três marcas de demonstração do `WHITELABEL.md` escrevendo as CSS vars direto no `documentElement` — dá pra ver o app inteiro repintando sem build, que é o ponto inteiro do ADR-0003, mesmo sem a tela real de identidade visual (isso é F1-E07).

`lint`, `typecheck`, `test` e `build` passam limpos; o servidor de dev sobe e responde 200 na raiz. Não confirmei visualmente em navegador — não há ferramenta de screenshot/browser disponível neste ambiente, então a checagem de "renderiza nas três larguras" ficou por revisão de responsividade das classes Tailwind (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), não por captura de tela real. Vale abrir `npm run dev -w @gym/web` e olhar manualmente antes de considerar o épico fechado de fato. Nada foi commitado.

### 01/08/2026 — F1-E03: domínio em `@gym/core`

Executei o épico F1-E03 por completo. `@gym/core` deixou de ser um workspace vazio: primeiro entraram os tipos de todas as entidades de `DATA-MODEL.md` em `shared/core/src/types/` (um arquivo por entidade, uniões literais em `common.ts` em vez de `enum`), depois `shared/core/src/dates/iso-date.ts` com os utilitários de data ISO, e por fim `shared/core/src/domain/` com uma função (ou pequeno grupo) por seção de `DOMAIN-RULES.md`.

O ponto mais delicado foi `computeDailyGoal` (TMB/TDEE/kcal-alvo/macros/água): a ordem de arredondamento importa — o carboidrato precisa usar a proteína e a gordura já arredondadas, não os valores brutos, senão o resultado diverge do documento. Reproduzi os quatro casos de referência de `DOMAIN-RULES.md §1.8` exatamente como especificado, e todos batem.

Escrevi teste para cada função de domínio, ao lado do código (59 testes novos). Um deles pegou um erro meu, não do código: escrevi `expect(increaseLoad(20.3)).toBe(22.5)`, mas 20,3 + 2,5 = 22,8, que arredonda para 23 (mais perto de 23 que de 22,5) — corrigi o teste, não a implementação, depois de conferir a conta.

Como no F1-E01/E02, `@gym/core` continua sem nenhuma dependência de runtime — só tipos e funções puras. `getWeekdayIndex` e `addDays` usam componentes locais de `Date` (ano/mês/dia via getters, não `toISOString`/UTC), pela mesma razão do resto do domínio: data de negócio é sempre local.

`npm run typecheck`, `npm run test` e `npm run lint` passam limpos na raiz, cobrindo os dois workspaces. Nada foi commitado.

### 01/08/2026 — F1-E04: repositórios e persistência

Executei o épico F1-E04 por completo. Comecei pelos contratos: `ARCHITECTURE.md` já documentava o agrupamento certo de repositórios (por agregado, não por entidade/coleção de `localStorage`), então segui isso ao pé da letra em `shared/core/src/repositories/` — oito interfaces (`GymRepository`, `UserRepository`, `StudentRepository`, `WorkoutRepository`, `ExecutionRepository`, `NutritionRepository`, `ActivityRepository`, `NoticeRepository`), todas com `gymId` explícito em todo método, nunca implícito.

Precisei de gerador de id em `@gym/core` e esbarrei numa restrição real: `crypto.randomUUID()` não tipa sem lib `DOM` ou `@types/node`, e `@gym/core` não tem nenhuma das duas de propósito (é TS puro, regra de `ARCHITECTURE.md`). Troquei por um gerador simples em cima de `Math.random` — não é criptográfico nem UUID de verdade, mas resolve o único requisito real aqui, que é não colidir dentro do `localStorage` de um navegador.

Do lado de `apps/web/src/storage/`, o desenho que motivei mais foi a migração: `migrate(data, fromVersion, migrations, toVersion)` recebe o registro de migrações e a versão-alvo como parâmetro em vez de constantes fixas, só para o teste poder simular uma migração real sem esperar a próxima mudança de schema acontecer (hoje `MIGRATIONS` está vazio, ainda estamos na v1). O envelope (`gymapp:v1`) e a sessão (`gymapp:session`) ficaram em módulos separados, como o `DATA-MODEL.md` pede — limpar dados de demonstração não pode derrubar login.

Cada repositório é um arquivo que lê o envelope inteiro, filtra/atualiza em memória e regrava — dataset pequeno demais para justificar índice ou storage incremental. `assign`/`unassign` em `WorkoutRepository` merecia cuidado: atribuir de novo ao mesmo aluno reativa a atribuição existente (não duplica), e desatribuir só marca `active: false`, nunca apaga, porque o histórico de series/cargas referencia o `planId` independente da atribuição estar ativa.

O seed ficou deliberadamente mínimo — uma academia e um professor placeholder, só para o app não abrir vazio. O seed completo com as três academias de `SEED-DATA.md` é explicitamente o F1-E05 no roadmap, e antecipar contas/ids aqui só criaria trabalho de desfazer depois.

Os testes cobrem exatamente os dois obrigatórios do épico: migração de schema (pura, incluindo o caso "versão salva mais nova que a do código" avisando e preservando dado em vez de apagar) e isolamento por tenant — reproduzi o caso Camila Reis de `SEED-DATA.md` (mesmo e-mail em duas academias, contas independentes) como teste real em `user-repository.test.ts`, não só como cenário documentado. Conferi com `grep` que `localStorage` só aparece dentro de `apps/web/src/storage/` — nenhum vazamento para fora da camada.

`npm run lint`, `typecheck`, `test` e `build` passam limpos na raiz. Nada foi commitado.

---

## Como atualizar este arquivo

Ao fim de cada sessão de trabalho:

1. Ajuste **Fase atual** e **Épico atual**
2. Mova o que terminou para **✅ Pronto** e o que ficou pela metade para **🚧 Em andamento**, dizendo exatamente onde parou
3. Reescreva **🔜 Próxima tarefa** de forma que alguém sem contexto consiga começar sozinho
4. Registre bloqueios e decisões novas
5. Acrescente uma entrada no **Log de sessões** com data e um parágrafo do que mudou e por quê
