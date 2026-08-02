# STATE.md — estado atual do projeto

> **Documento vivo.** Leia primeiro, atualize por último. É a fonte da verdade sobre onde o projeto está — não deduza o estado pelo código.

**Última atualização:** 01/08/2026
**Fase atual:** Fase 1 — PWA multi-tenant (ver [`ROADMAP.md`](ROADMAP.md))
**Épico atual:** F1-E02 concluído · próximo é F1-E03

---

## Onde estamos

O ferramental da Fase 1 está pronto e agora também o design system: `apps/web` renderiza uma página de showcase com os 11 componentes base, tokens de cor ligados a CSS vars e tipografia Barlow/Barlow Condensed local. `shared/core` ainda existe só como workspace vazio — é o próximo passo. Falta tudo o que é regra de negócio e tela de verdade.

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

## 🔜 Próxima tarefa

**F1-E03 · Domínio em `@gym/core`.** Ver detalhes em [`ROADMAP.md`](ROADMAP.md#épicos):

1. Tipos e enums (uniões literais, não `enum`) de todas as entidades de [`DATA-MODEL.md`](DATA-MODEL.md)
2. Funções puras de cálculo em `@gym/core/domain`, a partir de [`DOMAIN-RULES.md`](DOMAIN-RULES.md): TMB (Mifflin-St Jeor), TDEE, ajuste por objetivo, kcal-alvo, macros, meta de água, streak, progresso de séries, delta de carga
3. Utilitários de data em ISO (`YYYY-MM-DD`), já que datas de negócio circulam nesse formato
4. Zero dependência de runtime em `@gym/core` — é TypeScript puro, sem React/`localStorage`/`window`/`fetch`

*Aceite:* todas as fórmulas de [`DOMAIN-RULES.md`](DOMAIN-RULES.md) implementadas, com os casos de teste daquele documento passando.

Depois dela, seguir a ordem sugerida em [`ROADMAP.md`](ROADMAP.md#ordem-sugerida): `E04 → E05 → E06 → E07`, e só então `E13 → E14` antes das telas do aluno.

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

---

## Como atualizar este arquivo

Ao fim de cada sessão de trabalho:

1. Ajuste **Fase atual** e **Épico atual**
2. Mova o que terminou para **✅ Pronto** e o que ficou pela metade para **🚧 Em andamento**, dizendo exatamente onde parou
3. Reescreva **🔜 Próxima tarefa** de forma que alguém sem contexto consiga começar sozinho
4. Registre bloqueios e decisões novas
5. Acrescente uma entrada no **Log de sessões** com data e um parágrafo do que mudou e por quê
