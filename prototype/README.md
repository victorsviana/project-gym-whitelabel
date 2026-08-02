# Protótipo (referência congelada)

Este diretório guarda o protótipo original do app, que serve de **especificação visual e funcional** da Fase 1. Ele não é executado nem buildado pelo monorepo — é material de consulta.

## Arquivos

| Arquivo | O que é |
|---|---|
| `Academia Whitelabel - Demo.html` | Bundle original (1,5 MB). Abra direto no navegador para ver o protótipo rodando |
| `extracted/template.html` | Markup do app (877 linhas), com `<sc-if>` / `<sc-for>` e estilos inline |
| `extracted/logic.js` | Classe `Component` (444 linhas): estado, regras de negócio e handlers |
| `extracted/ios-frame.jsx` | Moldura de iPhone usada só para preview — **não portar** (ver aviso abaixo) |
| `unpack.mjs` | Regenera `extracted/` a partir do bundle |

**Consulte sempre `extracted/`, nunca o `.html` de 1,5 MB** — ler o bundle inteiro desperdiça contexto sem necessidade.

## Como o bundle funciona

O `.html` é um bundle de artifact. O conteúdo real está em três `<script>` com `type` próprio:

- `__bundler/manifest` — assets (JS do runtime, JSX, fontes woff2) em base64, a maioria gzipada
- `__bundler/template` — o markup do app, como string JSON
- `__bundler/ext_resources` — React 18, ReactDOM e Babel standalone

Para regenerar as fontes legíveis:

```bash
node prototype/unpack.mjs
```

## Aviso: a moldura de celular não faz parte do produto

`extracted/ios-frame.jsx` (`IOSDevice`, `IOSStatusBar`, `IOSNavBar`, `IOSGlassPill`, `IOSList`, `IOSKeyboard`) existe apenas para o protótipo aparentar um iPhone na tela do designer. O app da Fase 1 é **web responsivo de verdade**: nada de bezel, dynamic island, barra de status simulada ou largura fixa de 402×874.

## O que muda do protótipo para o produto

O protótipo é single-user e single-tenant, com o painel do professor em modo conceito. A Fase 1 nasce multi-tenant com os dois perfis funcionando. As diferenças estão em [`../docs/PROTOTYPE-AUDIT.md`](../docs/PROTOTYPE-AUDIT.md), junto com os defeitos identificados e suas correções.
