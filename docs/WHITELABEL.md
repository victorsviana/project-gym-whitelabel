# WHITELABEL.md — identidade visual por academia

Cada academia entrega o app com a própria marca. Trocar de academia repinta o app inteiro — **em runtime, sem rebuild, sem recarregar a página**. Essa exigência é o que determina toda a mecânica descrita aqui.

## O contrato de tema

```ts
interface GymTheme {
  brand: string;        // cor principal da academia — hex, ex. '#E4022E'
  brandFg: string;      // cor de texto/ícone sobre a cor principal — ex. '#FFFFFF'
  mode: 'dark' | 'light';   // tema padrão da academia (o aluno pode trocar)
}
```

Três campos, de propósito. A tentação é oferecer uma paleta inteira ao cliente; na prática o dono da academia sabe responder "qual é a cor da minha marca" e mais nada. Todo o resto — superfícies, bordas, texto secundário, estados — vem do sistema e é o mesmo para todas as academias.

As demais tonalidades são **derivadas** da cor principal por transparência, não escolhidas uma a uma.

## Como a cor chega na tela

### 1. Variáveis CSS aplicadas na raiz

Ao entrar na academia, o tema é escrito como custom properties no elemento raiz:

```css
:root {
  --brand: #E4022E;
  --brand-rgb: 228 2 46;     /* canais separados, sem vírgula */
  --brand-fg: #FFFFFF;
}
```

O par `--brand` / `--brand-rgb` existe porque os canais separados permitem aplicar opacidade em qualquer lugar: `rgb(var(--brand-rgb) / 12%)`. É o que gera os fundos suaves, as bordas tingidas e os halos sem precisar de mais nenhuma cor cadastrada.

### 2. Tokens do Tailwind apontando para as variáveis

```js
// tailwind.config.js
colors: {
  brand: {
    DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
    fg:      'var(--brand-fg)',
  },
  // superfícies e texto do sistema, também via vars, trocam com o tema claro/escuro
  bg: 'var(--bg)', surface: 'var(--surface)', border: 'var(--border)',
  fg: 'var(--fg)', muted: 'var(--fg-muted)', subtle: 'var(--fg-subtle)',
}
```

Com `<alpha-value>`, os modificadores de opacidade do Tailwind funcionam naturalmente: `bg-brand/10`, `border-brand/30`, `text-brand`.

### 3. Uso nos componentes

```jsx
<button className="bg-brand text-brand-fg">Iniciar treino</button>
<div   className="bg-brand/10 border border-brand/25">…</div>
```

**Nunca** `bg-red-600`, `bg-[#E4022E]` ou `style={{ background: '#E4022E' }}`. Cor literal em componente é o único jeito garantido de quebrar o whitelabel, e não aparece em teste — aparece no cliente.

## Temas escuro e claro

Independem da marca. São dois conjuntos de variáveis de sistema aplicados junto com as da marca:

| Token | Escuro | Claro |
|---|---|---|
| `--bg` | `#0A0B0A` | `#EEF0EA` |
| `--surface` | `rgb(255 255 255 / 3.5%)` | `rgb(0 0 0 / 4.5%)` |
| `--border` | `rgb(255 255 255 / 10%)` | `rgb(0 0 0 / 10%)` |
| `--fg` | `#F4F6F1` | `#16180F` |
| `--fg-muted` | `#c3c9b9` | `#3d4335` |
| `--fg-subtle` | `#8b937f` | `#727a66` |

A academia define o padrão; o aluno pode trocar em Ajustes, e a preferência dele vence. Valores completos em [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md).

## Cores fixas do sistema

Nem tudo acompanha a marca. Estas cores são semânticas e iguais em todas as academias, porque comunicam significado e não identidade:

| Uso | Cor |
|---|---|
| Proteína | `#FF5C43` |
| Carboidrato | `#F4B740` |
| Gordura | `#9C8BFF` |
| Hidratação / descanso | `#3FC7F2` |
| Sucesso, evolução positiva | `#12B76A` |
| Alerta, lesão | `#FF5C43` |
| Sequência (chama) | `#FF8A3D` |

Uma academia azul não deve fazer a barra de hidratação sumir dentro da identidade dela — por isso a hidratação não é a cor da marca.

## Quem configura, e quando

| Fase | Quem edita | Onde fica salvo |
|---|---|---|
| **1** | O professor, na tela "Identidade visual" do painel — na prática, você montando as demonstrações | `Gym.theme` no `localStorage` |
| **2** | O distribuidor, no painel de clientes; opcionalmente delegado ao admin da academia | Banco, servido pela API no bootstrap |
| **3** | Igual à Fase 2, aplicado ao abrir o app | API + cache local |

Na tela de identidade visual: nome, logo, cor principal, cor de contraste, presets prontos e **preview ao vivo** — o app já vai mudando de cor enquanto o seletor se move. É a demonstração que vende o produto.

## Contraste é validado, não confiado

A cor vem do cliente e pode ser qualquer coisa. Amarelo `#FFE100` com texto branco é ilegível, e o cliente vai pedir exatamente isso.

Duas defesas:

1. **Sugestão automática** — ao escolher a cor principal, o sistema calcula a luminância relativa e sugere preto ou branco como cor de contraste, o que já resolve a maioria dos casos.
2. **Aviso explícito** — se o par escolhido ficar abaixo de 4,5:1, a tela mostra um aviso de legibilidade. Não bloqueia (o cliente manda na marca dele), mas registra que foi avisado.

```
luminância(cor) → contraste(cor, #000) e contraste(cor, #FFF)
sugere o de maior contraste; alerta se o escolhido < 4,5:1
```

A função de cálculo mora em `@gym/core/theme` — é lógica pura e a Fase 2 vai precisar dela no painel do distribuidor.

## Logo

- Fase 1: upload convertido para data URL e guardado em `Gym.logo`. **Redimensionar antes de salvar** e limitar a ~200 KB — `localStorage` tem cerca de 5 MB no total
- Sem logo, o app usa as iniciais da academia sobre a cor principal, como no protótipo
- Fase 2: object storage, com URL no lugar do data URL. O contrato do campo não muda

## PWA por academia

O manifest é gerado com os dados da academia ativa: `name`, `short_name`, `theme_color`, `background_color` e ícone derivado do logo. Instalado, o app aparece na tela inicial do aluno com o nome e o ícone da academia dele — que é o ponto inteiro do whitelabel.

## Marcas de demonstração

O seed inclui três identidades bem diferentes entre si, para expor problemas de contraste e de composição logo cedo:

| Academia | Principal | Contraste | Tema |
|---|---|---|---|
| Gaviões Fitness | `#E4022E` vermelho | `#FFFFFF` | escuro |
| Bluefit | `#2E7BFF` azul | `#FFFFFF` | claro |
| Iron House | `#FF6B2C` laranja | `#0A0B0A` | escuro |

Detalhes e contas em [`SEED-DATA.md`](SEED-DATA.md).

## Checklist ao criar um componente

- [ ] Nenhuma cor literal, nenhum `bg-[#...]`, nenhum utilitário de paleta do Tailwind para cor de marca
- [ ] Texto sobre a cor da marca usa `text-brand-fg`, nunca `text-white` fixo
- [ ] Fundos suaves usam `bg-brand/10`, não uma cor clara escolhida a olho
- [ ] Cores semânticas (macros, água, sucesso, alerta) usam os tokens de sistema
- [ ] Renderiza corretamente nas três marcas de demonstração e nos dois temas
