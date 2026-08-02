# AGENTS.md — leia isto antes de qualquer coisa

Ponto de entrada para qualquer agente de IA (Claude Code, Cursor, Copilot, Codex…) que for trabalhar neste repositório.

## O projeto em 5 linhas

App **whitelabel para academias**. Cada academia é um cliente com identidade visual própria; dentro dela existem **dois perfis**: o **aluno** (vê treino e dieta, registra séries, cargas, refeições e água) e a **academia/professor** (cadastra alunos, monta treinos, atribui a alunos, publica). Três fases: **F1** PWA web com tudo em `localStorage`; **F2** API NestJS + PostgreSQL; **F3** app nativo Expo. Monorepo npm, com regra de negócio compartilhada em `shared/core`. UI em português do Brasil, código em inglês.

## Regra número 1

**Sempre comece lendo [`docs/STATE.md`](docs/STATE.md).** Ele diz a fase atual, o que já existe, o que está em andamento e qual é a próxima tarefa. Nunca deduza o estado do projeto pelo código — o `STATE.md` é a fonte da verdade.

**Sempre termine atualizando o [`docs/STATE.md`](docs/STATE.md)** com o que você fez, o que ficou pela metade e qual é a próxima tarefa. Uma sessão que não atualiza o `STATE.md` quebra a próxima.

## Mapa da documentação

| Preciso de… | Leia |
|---|---|
| Estado atual e próxima tarefa | [`docs/STATE.md`](docs/STATE.md) |
| O que é o produto, personas, escopo | [`docs/PROJECT.md`](docs/PROJECT.md) |
| As 3 fases, épicos e critérios de aceite | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Stack, camadas, estrutura de pastas | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Fórmulas de metas, macros, água, streak | [`docs/DOMAIN-RULES.md`](docs/DOMAIN-RULES.md) |
| Entidades e schema de dados | [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) |
| Quem enxerga o quê (academia × aluno) | [`docs/MULTI-TENANCY.md`](docs/MULTI-TENANCY.md) |
| Como as cores da marca funcionam | [`docs/WHITELABEL.md`](docs/WHITELABEL.md) |
| Telas, estados e componentes | [`docs/UI-SPEC.md`](docs/UI-SPEC.md) |
| Cores, tipografia, espaçamentos | [`docs/DESIGN-TOKENS.md`](docs/DESIGN-TOKENS.md) |
| O que o protótipo faz e o que está errado nele | [`docs/PROTOTYPE-AUDIT.md`](docs/PROTOTYPE-AUDIT.md) |
| Contas de teste para entrar no app | [`docs/SEED-DATA.md`](docs/SEED-DATA.md) |
| Padrões de código, commit, testes | [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) |
| Por que uma decisão foi tomada | [`docs/decisions/`](docs/decisions/) |

## Estrutura do repositório

```
apps/
  web/      Fase 1 — React 18 + TypeScript + Vite + Tailwind + PWA
  api/      Fase 2 — NestJS + Prisma + PostgreSQL      (ainda não iniciado)
  mobile/   Fase 3 — React Native + Expo               (ainda não iniciado)
shared/
  core/     tipos, contratos de repositório, regras de domínio, seed
docs/       toda a documentação
prototype/  protótipo original congelado, como referência visual
```

## Comandos

O gerenciador é **npm** (workspaces). Nunca use pnpm ou yarn aqui.

```bash
npm install                          # instala tudo, na raiz
npm run dev                          # sobe o app web
npm run test                         # testes de todos os workspaces
npm run typecheck                    # TypeScript de todos os workspaces
npm install <pkg> -w @gym/web        # adiciona dependência a um workspace
node prototype/unpack.mjs            # regenera as fontes legíveis do protótipo
```

## Regras de ouro

1. **Regra de negócio mora em `shared/core`**, em TypeScript puro, sem React e sem acesso a `localStorage`, `window` ou `fetch`. É o que as três apps compartilham — se você escreveu um cálculo dentro de um componente, está no lugar errado.
2. **Toda leitura e escrita de dado passa por um repositório** definido em `shared/core`. Na F1 o adapter é `localStorage`; na F2 vira HTTP. Componente que chama `localStorage` direto quebra a Fase 2.
3. **Nada de dado sem dono.** Toda entidade carrega `gymId`, e as do aluno também carregam `studentId`. Consulta sem filtro de tenant é bug de segurança, não descuido.
4. **Cores nunca são hardcoded.** A identidade visual vem do tema da academia, aplicado em runtime via CSS custom properties. Use os tokens do Tailwind (`bg-brand`, `text-brand-fg`), nunca `#FF6B2C` ou `bg-orange-500`.
5. **Não porte a moldura de iPhone** do protótipo. O app é responsivo de verdade: aluno mobile-first, painel da academia aproveitando telas largas.
6. **UI em português do Brasil, código em inglês.** Nomes de variável, função, arquivo e commit em inglês; tudo que o usuário lê, em PT-BR.
7. **O protótipo é referência, não código-fonte.** Copie comportamento e visual dele, não a arquitetura — ele é uma classe monolítica com estado global e vários defeitos catalogados em `docs/PROTOTYPE-AUDIT.md`.

## O que nunca fazer

- Escrever regra de negócio duplicada em `apps/web` que já existe em `shared/core`
- Consultar dados sem filtrar por `gymId`
- Usar `pnpm` / `yarn`, ou instalar dependência sem `-w <workspace>`
- Commitar `node_modules`, `.env` ou builds
- Editar arquivos em `prototype/` (é referência congelada; para regenerar, rode `unpack.mjs`)
- Deixar a sessão sem atualizar `docs/STATE.md`
