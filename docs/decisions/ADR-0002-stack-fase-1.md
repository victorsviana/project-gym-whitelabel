# ADR-0002 — React + TypeScript + Vite na Fase 1

**Data:** 01/08/2026 · **Status:** Aceita

## Contexto

A Fase 1 é um PWA sem backend: todo o estado vive no dispositivo, o app precisa funcionar offline dentro da academia e ser instalável na tela inicial do aluno. Não há nada a renderizar no servidor — todas as telas ficam atrás de autenticação e todo o conteúdo é do próprio usuário.

O protótipo já é React. E a Fase 3 será React Native, o que torna o reaproveitamento de lógica um critério de peso.

## Decisão

**React 18 + TypeScript strict + Vite**, com `vite-plugin-pwa` (Workbox) para o Service Worker, Zustand para estado, React Router para navegação e Vitest + Testing Library para testes.

## Alternativas consideradas

**Next.js (App Router).** Seria a escolha se houvesse landing page pública, SEO ou necessidade de API Routes como embrião do backend. Nada disso se aplica: o app inteiro é autenticado e a Fase 2 terá uma API própria em NestJS. Em troca viriam configuração mais pesada de PWA e offline, e um servidor Node para hospedar o que poderia ser um pacote estático.

**SvelteKit.** Bundle menor, DX excelente, menos código para o mesmo resultado. Recusado por um motivo só, mas decisivo: quebraria o reaproveitamento com React Native na Fase 3. O ganho de hoje custaria uma reescrita depois.

**Vue / Nuxt.** Mesmo argumento do SvelteKit, sem vantagem que compense.

**Continuar no formato do protótipo.** Uma classe com todo o estado é ótima para prototipar e insustentável para um produto multi-tenant com dois perfis.

## Consequências

**Bom:** build rápido e saída estática, hospedável em qualquer CDN; PWA de primeira classe; a lógica de domínio migra para React Native sem tradução; o protótipo React serve de referência direta.

**Ruim:** sem SSR, se um dia houver página pública ela precisará de outra solução; roteamento e estrutura de pastas ficam por nossa conta, em vez de vir prontos por convenção.

**Sobre o Zustand:** escolhido por ser pequeno e não exigir provider em volta da árvore. O estado persistido fica em stores alimentadas pelos repositórios, e não um espelho global do `localStorage` — que foi o padrão que travou o protótipo.
