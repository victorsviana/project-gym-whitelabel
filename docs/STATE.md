# STATE.md — estado atual do projeto

> **Documento vivo.** Leia primeiro, atualize por último. É a fonte da verdade sobre onde o projeto está — não deduza o estado pelo código.

**Última atualização:** 01/08/2026
**Fase atual:** Fase 1 — PWA multi-tenant (ver [`ROADMAP.md`](ROADMAP.md))
**Épico atual:** F1-E01 concluído · próximo é F1-E02

---

## Onde estamos

O ferramental da Fase 1 está pronto: `apps/web` é um app Vite + React + TypeScript strict de verdade, com lint, testes e Tailwind funcionando, e `shared/core` existe como workspace (ainda sem conteúdo de domínio). Falta tudo o que é tela e regra de negócio.

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

## 🔜 Próxima tarefa

**F1-E02 · Design system em Tailwind.** Ver detalhes em [`ROADMAP.md`](ROADMAP.md#épicos):

1. Ligar os tokens de cor do Tailwind às CSS vars de tema (adaptando o exemplo da [ADR-0003](decisions/ADR-0003-tailwind-tema-runtime.md) para a sintaxe `@theme` do Tailwind v4, já instalado)
2. Tipografia Barlow / Barlow Condensed; temas claro e escuro
3. Componentes base em `apps/web/src/ui/`: `Button`, `Card`, `Chip`, `Stepper`, `Toggle`, `Sheet`, `ProgressBar`, `Ring`, `SegmentedControl`, `EmptyState`, `Toast`
4. Responsivo desde o início, sem moldura de celular
5. Referência de valores: [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)

*Aceite:* uma página de showcase renderiza todos os componentes nos dois temas e em três larguras (360, 768, 1280).

Depois dela, seguir a ordem sugerida em [`ROADMAP.md`](ROADMAP.md#ordem-sugerida): `E03 → E04 → E05 → E06 → E07`, e só então `E13 → E14` antes das telas do aluno.

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

---

## Como atualizar este arquivo

Ao fim de cada sessão de trabalho:

1. Ajuste **Fase atual** e **Épico atual**
2. Mova o que terminou para **✅ Pronto** e o que ficou pela metade para **🚧 Em andamento**, dizendo exatamente onde parou
3. Reescreva **🔜 Próxima tarefa** de forma que alguém sem contexto consiga começar sozinho
4. Registre bloqueios e decisões novas
5. Acrescente uma entrada no **Log de sessões** com data e um parágrafo do que mudou e por quê
