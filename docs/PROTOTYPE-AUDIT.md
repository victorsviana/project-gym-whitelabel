# PROTOTYPE-AUDIT.md — auditoria do protótipo

Análise completa de `prototype/Academia Whitelabel - Demo.html`, feita em 01/08/2026. Serve a dois propósitos: registrar tudo que o protótipo faz (para não se perder nada na Fase 1) e catalogar o que ele faz errado (para não se copiar o defeito junto com o comportamento).

## O que foi analisado

| Fonte | Tamanho | Conteúdo |
|---|---|---|
| `extracted/template.html` | 877 linhas | Markup declarativo com `<sc-if>` / `<sc-for>`, estilos inline, ícones SVG |
| `extracted/logic.js` | 444 linhas | Classe `Component extends DCLogic`: estado, regras, handlers |
| `extracted/ios-frame.jsx` | 350 linhas | Moldura de iPhone — **preview apenas, não portar** |

Runtime: React 18 + Babel standalone, fontes Barlow e Barlow Condensed embutidas em woff2.

## Arquitetura do protótipo

Uma única classe concentra tudo: 40 campos de estado, ~60 handlers e um método `renderVals()` de 270 linhas que monta um objeto gigante consumido pelo template. Funciona muito bem como protótipo — permite iterar visual em minutos — e não sobrevive a um produto: não há separação entre domínio, dado e apresentação, e cada tela nova aumenta o mesmo arquivo.

**O protótipo é referência de comportamento e visual, não de arquitetura.**

---

## Inventário funcional

### Fluxo macro (`state.phase`)
`login` → `onboarding` (7 passos) → `analyzing` → `plan` → `app`

### Abas (`state.tab`)
`home` · `treino` · `dieta` · `perfil`

### Sobreposições (`state.overlay`)
`workout` · `food` · `dayView` · `metas` · `settings` · `admin` (+ `adminStudent`) · `brand`

### Funcionalidades por área

| Área | O que faz |
|---|---|
| **Login** | Marca, headline, campos decorativos, dois botões de entrada, seletor de marca |
| **Onboarding** | 7 passos com barra de progresso, steppers com limites, seleção múltipla com opção excludente |
| **Processamento** | Percentual simulado (tique de ~230 ms) com quatro mensagens |
| **Plano** | Calorias, macros, TMB, TDEE, ajuste, alerta de treino adaptado |
| **Home** | Saudação, treino do dia por dia da semana, calendário com dias ativos e sequência, anel de calorias, barras de macros, hidratação em copos |
| **Treino** | Seis planos (A–F) com progresso de séries e selo *Adaptado* |
| **Detalhe** | Cronômetro de sessão, descanso com três predefinições, marcação de séries, carga ±2,5 kg, histórico de seis cargas com delta |
| **Dieta** | Refeições do dia agrupadas por tipo, remoção, três sugestões, histórico de sete dias |
| **Alimento** | Chips de refeição por horário, três métodos (buscar em 12 alimentos por 100 g, escrever, áudio simulado) |
| **Extrato do dia** | Refeições e treinos de uma data |
| **Metas** | Ajuste de calorias, proteína, carboidrato e água |
| **Ajustes** | Tema, dados da avaliação, três preferências de notificação |
| **Perfil** | Três estatísticas, navegação, trocar marca, sair |
| **Painel (conceito)** | Alunos (2 indicadores + 5 alunos mock + ficha), Treinos (editar exercícios, publicar com toast), Avisos (4 pendências, resolver) |
| **Marca** | 3 presets + marca customizada com nome, logo e 6 cores |

### O que já persiste

Chave `wl_state` no `localStorage`, com whitelist de 17 campos: `sets`, `meta`, `ans`, `activeDays`, `notif`, `brand`, `theme`, `mealsByDay`, `loads`, `plans`, `workoutDays`, `customName`, `customLogo`, `customColor`, `customText`, `notifs`, `water`.

---

## Defeitos

Cada item tem correção definida e o épico da Fase 1 onde é resolvido.

### 1 · Chave de dia sem zero à esquerda quebra ordenação
`dayKey()` gera `2026-8-1`. Ordenar essas chaves como texto coloca `2026-8-9` depois de `2026-8-10`, e o histórico da dieta aparece fora de ordem na virada de mês.
**Correção:** data local em ISO `YYYY-MM-DD`, sempre com zero à esquerda.
**Onde:** `F1-E03` (utilitário de data) · `F1-E11`

### 2 · Séries concluídas não têm data
`sets` é um mapa `plano-exercício-série → true`, sem dia. O progresso nunca reseta: o treino marcado uma vez fica "completo" para sempre, e o aluno perde exatamente o indicador que o traria de volta amanhã.
**Correção:** `SetLog` com `date`; o progresso do plano é calculado sobre o dia corrente.
**Onde:** `F1-E04` · `F1-E10`

### 3 · Carga indexada só pelo nome do exercício
`loads[nomeDoExercicio]` é global. "Remada baixa" no plano B e no plano E compartilham histórico, e o gráfico de evolução mistura duas coisas diferentes.
**Correção:** chave `studentId + planId + exerciseId + date`.
**Onde:** `F1-E04` · `F1-E10`

### 4 · Abrir o app conta como dia ativo
`componentDidMount` marca `activeDays[hoje] = true`. A sequência cresce só de abrir o app, o que esvazia o significado da métrica.
**Correção:** dia ativo exige série marcada ou refeição registrada.
**Onde:** `F1-E03` · `F1-E09`

### 5 · Não há autenticação nem separação de usuários
Dois botões entram no app; existe um único usuário implícito e uma única academia. `firstName` é `'Victor'` ou `'Aluna'`, derivado do sexo escolhido.
**Correção:** contas reais (mockadas), sessão persistida, papéis e multi-tenancy.
**Onde:** `F1-E06`

### 6 · Painel do professor é fachada
Os cinco alunos, os indicadores (248 ativos, 31 a revisar) e as quatro pendências são literais no código. Publicar um treino só mostra um toast — nada muda para nenhum aluno. Os planos editados são globais, iguais para todo mundo.
**Correção:** painel funcional sobre dados reais do tenant, com atribuição por aluno.
**Onde:** `F1-E13` · `F1-E14` · `F1-E15`

### 7 · Duas bases de alimentos e um campo morto
`foods` (6 itens com porção pronta) alimenta as sugestões; `foodsDB` (12 itens por 100 g) alimenta a busca. O campo `meals` do estado existe, é persistido e nunca é usado — quem guarda as refeições é `mealsByDay`.
**Correção:** base única por 100 g; sugestões viram porções pré-definidas sobre ela; remover o campo morto.
**Onde:** `F1-E03` · `F1-E11`

### 8 · Cronômetros perdem tempo em segundo plano
Um `setInterval` de 1 s incrementa os contadores. Com a aba oculta ou o celular bloqueado, o navegador estrangula o intervalo e o tempo registrado fica menor que o real — justamente durante um treino, que é quando a tela apaga.
**Correção:** guardar o instante de início e derivar o tempo decorrido; o intervalo apenas redesenha.
**Onde:** `F1-E10`

### 9 · Sem edição de dias anteriores e sem estados vazios
Só é possível remover refeições de hoje. E não existe estado vazio de verdade: como os dados são mock, nenhuma lista jamais aparece vazia — o que esconde o caso mais comum do produto real, o aluno recém-cadastrado sem nada registrado.
**Correção:** edição por data e os quatro estados de lista em toda a interface.
**Onde:** `F1-E11` · `F1-E19`

### 10 · Layout preso à moldura de iPhone
Tudo vive dentro de um `IOSDevice` de 402×874 px, com bezel, dynamic island e barra de status simulada. Não é responsivo: é um desenho de celular dentro de uma página.
**Correção:** app responsivo real, mobile-first para o aluno, aproveitando telas largas no painel. A moldura não é portada.
**Onde:** `F1-E02` · `F1-E19`

---

## Observações que não são defeitos

Comportamentos que parecem erro mas são decisões conscientes do protótipo, e devem ser preservados:

- **A tela de processamento é teatro.** Não há cálculo demorado — o anel existe para dar peso ao resultado. Manter, com duração curta.
- **O registro por áudio é simulado**, com valores fixos. Manter na Fase 1, explicitamente rotulado como demonstração; virar IA real é decisão da Fase 2.
- **Repetições são texto livre** (`"8–10"`, `"40s"`). Parece falta de tipagem, mas carrega informação que um número perderia.
- **O plano "F · Livre (a definir)"** existe para mostrar o estado de plano vazio.
- **Cores de macro e hidratação não seguem a marca.** São semânticas, e é proposital.
