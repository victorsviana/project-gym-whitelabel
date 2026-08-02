# ADR-0001 — Monorepo com npm workspaces

**Data:** 01/08/2026 · **Status:** Aceita

## Contexto

O produto vai existir em três superfícies — web, API e app nativo — construídas em momentos diferentes, com meses de distância entre elas. As três compartilham a mesma regra de negócio: cálculo de metas, macros, sequência, progressão de carga, e os mesmos tipos de entidade.

Se cada superfície tiver seu próprio repositório, essa regra será copiada três vezes. Na prática isso significa que uma correção na fórmula de água vai ser aplicada em duas delas e esquecida na terceira, e ninguém vai perceber até um aluno reclamar que o app do celular mostra número diferente do site.

## Decisão

Monorepo único com **npm workspaces**:

```
apps/web · apps/api · apps/mobile
shared/core
```

`shared/core` (`@gym/core`) concentra tipos, regras de domínio puras e contratos de repositório, e é consumido pelas três apps como dependência de workspace.

Gerenciador: **npm**. Sem Turborepo ou Nx por enquanto — entram se e quando o tempo de CI incomodar.

## Alternativas consideradas

**Repositórios separados com pacote npm publicado para o núcleo.** Funciona, e é o caminho certo quando os times são independentes. Aqui só multiplica cerimônia: cada ajuste de fórmula viraria publicar versão, atualizar dependência em dois repositórios e abrir dois PRs. Com um desenvolvedor, o custo é todo overhead.

**Copiar a regra em cada projeto.** Rápido no primeiro dia, caro em todos os outros. É exatamente o problema que a decisão existe para evitar.

**pnpm workspaces.** Tecnicamente superior — mais rápido, `node_modules` mais enxuto, resolução mais estrita. Recusado por decisão explícita: npm vem com o Node, não exige instalação extra e é o que qualquer pessoa ou agente de IA assume por padrão ao entrar no projeto. A diferença de desempenho não paga o atrito nesta escala.

**Turborepo desde o início.** Resolve um problema de tempo de build que ainda não existe. Adicionar depois é barato; carregar a configuração desde já, não.

## Consequências

**Bom:** uma fonte de verdade para a regra de negócio; mudança atômica atravessando web e API em um commit; `npm install` na raiz resolve tudo; qualquer IA entende a estrutura sem explicação.

**Ruim:** `node_modules` maior e instalação mais lenta que pnpm; sem cache de build até adotar Turborepo; disciplina obrigatória para não importar `apps/web` de dentro de `shared/core` — o lint precisa barrar isso.

**Consequência que vale registrar:** `shared/core` fica sem dependência de runtime, de propósito. É o que permite que o mesmo código rode no navegador, no Node e no React Native sem adaptação.
