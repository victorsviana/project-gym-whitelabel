# ADR-0006 — React Native + Expo na Fase 3

**Data:** 01/08/2026 · **Status:** Aceita

## Contexto

O PWA cobre bem a maior parte do uso, mas esbarra em limites reais no celular: notificação push no iOS é frágil e depende do app estar instalado na tela inicial; não há acesso a HealthKit ou Google Fit; e, sobretudo, uma academia que compra whitelabel quer o app dela **na App Store e na Play Store**, com o próprio ícone. Estar na loja é parte do que se está vendendo.

Na Fase 3 já existirá uma API estável e um núcleo de domínio em TypeScript exercitado por duas fases.

## Decisão

**React Native com Expo** e expo-router, dentro do mesmo monorepo, reaproveitando `@gym/core` por inteiro: tipos, regras de domínio e cliente de API gerado do OpenAPI.

## Alternativas consideradas

**Capacitor, embrulhando o PWA.** Publicaria nas lojas em dias, com push nativo, reaproveitando 100 % da web. É a opção mais barata por larga margem, e continua sendo a resposta certa se a Fase 3 precisar sair rápido ou com orçamento curto. Recusada como plano principal porque a interface segue sendo webview: rolagem, gestos e transições não têm a resposta que se espera de um app, e o produto é vendido justamente como "o app da sua academia".

**Flutter.** Melhor desempenho de interface e animação, e um ecossistema maduro. Recusado porque zera o reaproveitamento: toda a regra de domínio teria que ser reescrita em Dart, e o projeto passaria a manter a mesma fórmula em duas linguagens — que é exatamente o problema que o monorepo existe para evitar.

**Nativo puro (Swift + Kotlin).** Melhor resultado possível e o triplo do trabalho. Fora de proporção para o tamanho do projeto.

## Consequências

**Bom:** a regra de negócio já está pronta e testada em `@gym/core`; push nativo, biometria, deep links e HealthKit ficam acessíveis; EAS resolve build e distribuição sem infraestrutura própria; quem escreveu a web escreve o app.

**Ruim:** as telas precisam ser reescritas — Tailwind e DOM não atravessam para React Native, então o design system ganha uma segunda implementação; publicação nas lojas traz processo de revisão, contas de desenvolvedor e ciclo de release mais lento; e há um custo permanente de manter duas superfícies de interface sobre o mesmo núcleo.

## Decisão em aberto

**Whitelabel nativo tem dois modelos, e a escolha é comercial antes de técnica:**

1. **Um binário por academia** — cada cliente publica com a própria marca, ícone e nome na loja. É o que o cliente quer ouvir. Custa uma conta de desenvolvedor e um ciclo de release por cliente, multiplicando manutenção.
2. **App único multi-marca** — a academia é escolhida no login e o tema se aplica em runtime, exatamente como na Fase 1. Um binário só, uma publicação só; em troca, a marca do cliente não aparece na loja.

Um caminho intermediário viável: começar com o app único e oferecer o binário dedicado como item de contrato para os clientes maiores.

Registrar a escolha em uma nova ADR quando for tomada.
