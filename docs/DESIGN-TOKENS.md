# DESIGN-TOKENS.md — tokens visuais

Valores extraídos do protótipo e normalizados para Tailwind. A mecânica de aplicação (CSS vars, troca em runtime) está em [`WHITELABEL.md`](WHITELABEL.md).

## Cor

### Marca — vem da academia

| Token | Origem |
|---|---|
| `--brand` | `Gym.theme.brand` |
| `--brand-rgb` | canais de `--brand`, separados por espaço |
| `--brand-fg` | `Gym.theme.brandFg` |

Tonalidades derivadas por opacidade, nunca cadastradas: `bg-brand/8` (halo), `/12` (fundo suave), `/16` (fundo de ícone), `/25` (borda tingida).

### Sistema — tema escuro (padrão)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0A0B0A` | fundo da aplicação |
| `--input` | `#0f120e` | campos e miolo do anel |
| `--sheet` | `#141610` | bottom sheets |
| `--surface` | `rgb(255 255 255 / 3.5%)` | cartões |
| `--surface-2` | `rgb(255 255 255 / 7%)` | cartões elevados, trilhos |
| `--border` | `rgb(255 255 255 / 10%)` | bordas |
| `--fg` | `#F4F6F1` | texto principal |
| `--fg-muted` | `#c3c9b9` | texto secundário |
| `--fg-subtle` | `#8b937f` | apoio, legendas |
| `--fg-faint` | `#6c7566` | ícone inativo |
| `--nav` | `rgb(12 13 11 / 94%)` | barra de navegação |
| `--scrim` | `rgb(5 6 5 / 72%)` | fundo de modal |

### Sistema — tema claro

| Token | Valor |
|---|---|
| `--bg` | `#EEF0EA` |
| `--input` | `#FFFFFF` |
| `--sheet` | `#FFFFFF` |
| `--surface` | `rgb(0 0 0 / 4.5%)` |
| `--surface-2` | `rgb(0 0 0 / 7%)` |
| `--border` | `rgb(0 0 0 / 10%)` |
| `--fg` | `#16180F` |
| `--fg-muted` | `#3d4335` |
| `--fg-subtle` | `#727a66` |
| `--fg-faint` | `#9aa08d` |
| `--nav` | `rgb(252 253 250 / 92%)` |
| `--scrim` | `rgb(20 22 16 / 40%)` |

### Semânticas — iguais em todas as academias

| Token | Valor | Uso |
|---|---|---|
| `--protein` | `#FF5C43` | proteína, alerta, erro |
| `--carbs` | `#F4B740` | carboidrato, atenção |
| `--fat` | `#9C8BFF` | gordura, informação |
| `--water` | `#3FC7F2` | hidratação, descanso |
| `--success` | `#12B76A` | evolução positiva, resolvido |
| `--streak` | `#FF8A3D` | sequência |

O painel da academia usa um fundo escuro próprio (`#0d0f12`, cartões `#151922`) para se distinguir do app do aluno mesmo compartilhando a cor de marca.

## Tipografia

Duas famílias, com papéis bem separados. É o que dá ao app a cara de "academia" em vez de dashboard genérico.

| Família | Uso | Pesos |
|---|---|---|
| **Barlow Condensed** | Títulos, números grandes, rótulos de botão, tudo em caixa alta | 700, 800 |
| **Barlow** | Texto corrido, rótulos de formulário, descrições | 400, 600, 700 |

```
--font-display: 'Barlow Condensed', system-ui, sans-serif;
--font-sans:    'Barlow', system-ui, sans-serif;
```

### Escala

| Papel | Família | Tamanho / entrelinha | Peso | Extras |
|---|---|---|---|---|
| Display | Condensed | 58 / 0.9 | 800 | caixa alta |
| Título de tela | Condensed | 30–36 / 1 | 800 | caixa alta |
| Título de seção | Condensed | 19–26 / 1 | 700 | caixa alta |
| Número de destaque | Condensed | 44 / 1 | 800 | tabular |
| Métrica | Condensed | 20–26 / 1 | 800 | tabular |
| Corpo | Barlow | 15–16 / 1.45 | 400 | |
| Corpo forte | Barlow | 14 / 1.4 | 600 | |
| Legenda | Barlow | 12–13 / 1.35 | 400 | |
| Rótulo | Barlow | 11–12 | 600 | caixa alta, `letter-spacing: .1em` |

**Números sempre com `font-variant-numeric: tabular-nums`** — cronômetro, cargas, calorias. Sem isso os dígitos dançam a cada tique.

Fontes servidas localmente (as woff2 estão no bundle do protótipo, em `prototype/extracted/`), com `font-display: swap`, sem CDN externa.

## Espaçamento

Escala padrão do Tailwind. Padrões recorrentes:

| Contexto | Valor |
|---|---|
| Respiro lateral da tela | `20px` (`px-5`) |
| Espaço entre cartões | `12–16px` |
| Interior de cartão | `16px` |
| Interior de sheet | `20px` |
| Folga do rodapé (barra de navegação) | `100px` |

## Raio de borda

| Elemento | Raio |
|---|---|
| Chip, badge | `999px` |
| Botão, campo | `12–14px` |
| Cartão | `16–18px` |
| Cartão de destaque | `20px` |
| Sheet (topo) | `26px` |
| Ícone quadrado | `10–13px` |

Raio generoso é parte da identidade do produto — cartões abaixo de 12 px destoam.

## Elevação

Sombra é usada com parcimônia; a hierarquia vem de superfície e borda. As exceções:

- Botão principal: `0 8px 24px rgb(var(--brand-rgb) / 30%)`
- Logo da marca: `0 8px 22px rgb(var(--brand-rgb) / 35%)`
- Barra de navegação: `backdrop-filter: blur(12px)` sobre `--nav`

## Movimento

| Animação | Duração | Curva |
|---|---|---|
| Entrada de conteúdo (subir + esmaecer) | 320–400 ms | `ease` |
| Barra e anel de progresso | 300–400 ms | `ease` |
| Toast (entra, espera, sai) | 2,2 s | `ease` |
| Spinner de processamento | 1 s | `linear`, infinito |

Tudo dentro de `@media (prefers-reduced-motion: reduce)`, onde as transições viram instantâneas e o spinner deixa de girar.

## Ícones

SVG inline com `stroke="currentColor"`, `stroke-width` entre 1.8 e 2, `viewBox="0 0 24 24"`, traço arredondado. Tamanhos: 14 (legenda), 18–20 (linha), 23 (navegação). Os traços do protótipo estão em `prototype/extracted/template.html` e podem ser reaproveitados.

## Layout

| Token | Valor |
|---|---|
| Largura máxima do app do aluno | `28rem` (`max-w-md`) |
| Largura máxima do painel | `80rem` (`max-w-7xl`) |
| Altura da barra de navegação | `56px` + área segura |
| Altura de alvo de toque | mínimo `44px` |
