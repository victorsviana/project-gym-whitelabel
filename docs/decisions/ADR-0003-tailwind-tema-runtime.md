# ADR-0003 — Tailwind com tokens ligados a CSS vars

**Data:** 01/08/2026 · **Status:** Aceita

## Contexto

O produto é whitelabel: cada academia tem a própria cor. E a troca precisa acontecer **em runtime** — no painel de identidade visual, mover o seletor de cor repinta o app na hora, e essa demonstração ao vivo é parte do que vende o produto.

Isso elimina de saída qualquer solução que resolva cor em tempo de build. Não pode existir um build por cliente.

O protótipo usava estilos inline com variáveis CSS, o que resolvia o runtime mas produzia atributos `style` de duzentos caracteres, impossíveis de reaproveitar.

## Decisão

**Tailwind**, com os tokens de cor apontando para CSS custom properties definidas na raiz do documento:

```css
:root { --brand: #E4022E; --brand-rgb: 228 2 46; --brand-fg: #FFFFFF; }
```

```js
colors: {
  brand: {
    DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
    fg: 'var(--brand-fg)',
  },
}
```

Entrar na academia reescreve as variáveis; o app inteiro se repinta sem recarregar e sem rebuild. Os canais separados em `--brand-rgb` fazem os modificadores de opacidade do Tailwind funcionarem: `bg-brand/10`, `border-brand/25`.

## Alternativas consideradas

**Um build por academia, com a cor no `tailwind.config`.** Gera CSS mínimo e perfeitamente otimizado. Inviável aqui: significa um deploy por cliente, e mata o preview ao vivo — o cliente teria que esperar um build para ver a própria cor.

**CSS-in-JS (styled-components, Emotion).** Resolve tema em runtime com elegância. Recusado pelo custo de runtime no celular popular, que é o dispositivo alvo, e por ir contra a decisão de manter o bundle enxuto.

**Estilos inline, como no protótipo.** Funciona e é o que já existe. Não escala: nada é reutilizável, não há estados de `hover` e `focus`, responsividade vira `if` em JavaScript e o markup fica ilegível.

**CSS Modules com variáveis.** Funciona bem, mas exige escrever e nomear cada classe à mão. Tailwind entrega o mesmo resultado com muito menos código próprio.

## Consequências

**Bom:** uma única build serve todas as academias; troca de cor instantânea, com preview ao vivo; tema claro e escuro pelo mesmo mecanismo; os utilitários de opacidade geram todas as tonalidades derivadas sem cadastrar cor nenhuma.

**Ruim:** as cores de marca não aparecem no autocomplete do editor como valor concreto; é possível burlar o sistema escrevendo `bg-[#E4022E]`, e só lint e revisão impedem — por isso a proibição está explícita em [`CONVENTIONS.md`](../CONVENTIONS.md) e em [`AGENTS.md`](../../AGENTS.md).

**Efeito colateral positivo:** como toda cor de marca passa por variável, validar contraste vira algo central e barato — o sistema calcula a luminância e sugere preto ou branco como cor de texto, e avisa quando o par escolhido pelo cliente fica ilegível.
