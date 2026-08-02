# UI-SPEC.md — telas e componentes

Inventário do que precisa existir na Fase 1, com a checklist de paridade usada para validar a fase. As telas do aluno vêm do protótipo (`prototype/extracted/template.html`); as da academia são novas ou promovidas de conceito para funcional.

> **A moldura de iPhone do protótipo não existe aqui.** Nada de bezel, dynamic island, barra de status simulada ou largura travada em 402 px.

## Layout e responsividade

| Superfície | Comportamento |
|---|---|
| **App do aluno** | Mobile-first. Coluna única com `max-w-md` centralizada; em telas largas, fundo neutro em volta. Navegação inferior fixa com quatro abas |
| **Painel da academia** | Responsivo de verdade. No celular, coluna única com navegação superior; a partir de `lg`, layout de duas colunas (lista à esquerda, detalhe à direita) e tabelas aproveitando a largura |
| **Faixa suportada** | 320 px a desktop, sem rolagem horizontal em nenhuma largura |

---

## Fluxo de entrada

| Tela | Conteúdo | Estados |
|---|---|---|
| **Seletor de perfil** | Marca do produto, dois cartões: *Sou aluno* · *Sou academia/professor*. Atalho para o modo demo | — |
| **Login** | E-mail, senha, entrar, ir para cadastro, voltar ao seletor | erro de credencial, carregando |
| **Cadastro do aluno** | Nome, e-mail, senha, **seleção da academia** (lista com marca de cada uma) | validação de campo, e-mail já usado |
| **Cadastro do professor** | Nome, e-mail, senha e: criar academia nova (nome, cor, logo) ou entrar em existente | idem |
| **Modo demo** | Lista de todas as contas de seed com papel e academia, entrada em um toque | só em build de desenvolvimento |

---

## App do aluno

### Onboarding — 7 passos

| Passo | Conteúdo |
|---|---|
| 0 | Boas-vindas com o nome da academia e o que será perguntado |
| 1 | Sexo biológico (2 opções) + idade (stepper, 14–90) |
| 2 | Peso (35–220 kg) e altura (130–220 cm), em steppers |
| 3 | Objetivo: ganhar massa · perder gordura · manter/performance, com subtítulo explicativo |
| 4 | Nível (iniciante/intermediário/avançado) + dias por semana (stepper, 1–7) |
| 5 | Lesões e limitações, seleção múltipla, com *Nenhuma* excludente |
| 6 | Restrições alimentares, seleção múltipla, com *Nenhuma* excludente |

Comuns a todos: barra de progresso, contador `passo/6`, botão voltar, botão avançar com rótulo que muda no primeiro e no último passo, animação de entrada.

**Processamento** — anel com percentual e quatro mensagens em sequência. É teatro deliberado: dá peso ao resultado. Deve ser rápido o bastante para não irritar (~2 s).

**Metas prontas** — selo "perfil pronto", calorias em destaque, três blocos de macros, detalhamento de TMB / TDEE / ajuste, alerta de treino adaptado quando há lesão, botão de entrar no app.

### Home

- Cabeçalho: logo e nome da academia, saudação com data por extenso, atalho para ajustes
- **Card do treino de hoje**: letra e nome do plano, foco e duração, professor responsável, *Iniciar treino* e *Ver plano*
  - *Vazio:* "seu professor ainda não montou seu treino" — estado real de aluno recém-cadastrado
- **Constância**: calendário do mês, dias ativos destacados na cor da marca, hoje contornado, selo de sequência, contagem de dias ativos, toque no dia abre o extrato
- **Metas de hoje**: anel de calorias com consumido/alvo, restante, três barras de macros, atalhos *Ajustar* e *+ Registrar*
- **Hidratação**: copos de 250 ml, total em litros, botões de adicionar e remover

### Treino

- Lista dos planos atribuídos: letra, nome, dia, foco, duração, barra de progresso, contador de séries, selo de conclusão, selo *Adaptado*
- Rodapé informativo: montado por *professor* · *academia*, atualizado em *data*
- *Vazio:* nenhum plano atribuído

### Detalhe do treino (tela cheia)

- Cabeçalho com nome, dia, foco e duração
- **Cronômetro de sessão** — mm:ss, iniciar/pausar, zerar
- **Descanso** — mm:ss, três predefinições (60 s, 90 s, 2 min), destaque quando ativo, alerta visual nos últimos 10 s
- Por exercício: nome, séries × repetições, selo *Adaptado*, células de série clicáveis, ajuste de carga (−2,5 / valor / +2,5), botão registrar, histórico com barras das últimas seis cargas e delta desde o início

### Dieta

- Refeições de hoje agrupadas por tipo, com total por grupo e remoção de item
- Sugestões rápidas com adição em um toque
- Histórico dos últimos sete dias: data, total, número de refeições, resumo de macros, barra contra a meta
- *Vazio:* nenhuma refeição registrada hoje

### Registro de alimento (sheet)

- Chips de tipo de refeição, pré-selecionado pelo horário
- Três métodos:
  - **Buscar** — lista da base por 100 g → quantidade com stepper de 10 g e atalhos 50/100/150/200 g → macros calculados em tempo real
  - **Escrever** — nome livre + steppers de calorias e macros
  - **Áudio** — botão de gravação, resultado preenchido para conferência (simulado na Fase 1, explicitamente rotulado como demonstração)
- Botão de adicionar com o nome da refeição de destino

### Extrato do dia (sheet)

Data por extenso, total de calorias, refeições agrupadas por tipo, treinos realizados naquele dia. Estados vazios independentes para refeições e treinos.

### Metas (sheet)

Ajuste de calorias (±50), proteína (±5), carboidrato (±10) e água (±250 ml), com efeito imediato na Home.

### Ajustes

Tema escuro/claro, dados da avaliação, três preferências de notificação, informações do plano da academia, versão.

### Perfil

Iniciais e nome, três estatísticas (sequência, dias no mês, séries), navegação para ajustes e metas, sair da conta.

### Navegação

Barra inferior fixa com quatro abas — Início · Treino · Dieta · Perfil.

---

## Painel da academia

### Visão geral

Indicadores reais do tenant: alunos ativos, alunos sem treino, pendências abertas, treinos publicados. Atalhos para as tarefas frequentes.

### Alunos

- Lista com busca por nome e filtro por situação (ativo, sem treino, a revisar)
- Cada linha: iniciais, nome, objetivo, frequência, etiqueta de situação
- **Ficha do aluno**: avaliação completa, alerta de lesão em destaque, restrições, planos atribuídos, última atividade, ações de atribuir treino e editar
- **Cadastrar aluno**: nome, e-mail, senha inicial; opcionalmente já preenchendo a avaliação
- *Vazio:* academia sem alunos, com chamada para cadastrar o primeiro

### Treinos

- Seletor de planos da academia + criar novo
- Edição: nome, letra, foco, dia, duração
- Exercícios: nome, séries, repetições, regiões sensíveis, reordenar, remover, adicionar, duplicar plano
- **Atribuição**: seleção múltipla de alunos, com indicação de quem já tem o plano
- **Publicar** com confirmação e aviso de que o aluno recebe na hora
- *Vazio:* plano sem exercícios

### Avisos

Fila de pendências derivadas dos dados (aluno novo sem treino, pedido de troca, reavaliação vencida), com tipo, aluno, tempo, ação de resolver e atalho para a tela correspondente. Contador na aba.

### Identidade visual

Nome, logo com upload e preview, cor principal, cor de contraste, presets, aviso de contraste insuficiente, preview ao vivo do app do aluno.

---

## Componentes do design system

`Button` (primário, secundário, fantasma, perigo; três tamanhos) · `IconButton` · `Card` · `Sheet` (bottom sheet no mobile, modal no desktop) · `Chip` / `ChipGroup` · `SegmentedControl` · `Stepper` · `Toggle` · `ProgressBar` · `Ring` (anel de progresso) · `Avatar` (iniciais ou imagem) · `Badge` / `Tag` · `Toast` · `EmptyState` · `Calendar` · `BottomNav` · `AppHeader` · `Field` (label, input, erro) · `Select` · `Skeleton`

Nenhum deles conhece domínio: recebem dados prontos e disparam callbacks.

---

## Estados obrigatórios

Toda lista precisa dos quatro. O protótipo só tinha o terceiro, e é onde o app de verdade costuma quebrar.

1. **Carregando** — esqueleto, nunca spinner de tela cheia
2. **Vazio** — mensagem explicando o que fazer, com ação quando fizer sentido
3. **Com conteúdo**
4. **Erro** — mensagem em português e caminho de recuperação

---

## Checklist de paridade com o protótipo

Percorra o protótipo (`prototype/Academia Whitelabel - Demo.html`) com esta lista aberta.

**Onboarding e metas**
- [ ] 7 passos, com barra de progresso e contador
- [ ] Steppers de idade, peso, altura e dias respeitam os limites
- [ ] *Nenhuma* limpa as outras opções nas seleções múltiplas
- [ ] Tela de processamento com percentual e mensagens
- [ ] Metas conferem com [`DOMAIN-RULES.md`](DOMAIN-RULES.md) (casos A–D)
- [ ] Alerta de treino adaptado aparece quando há lesão

**Home**
- [ ] Card do treino de hoje escolhe o plano pelo dia da semana
- [ ] Calendário destaca dias ativos, hoje e sequência
- [ ] Toque no dia abre o extrato daquela data
- [ ] Anel de calorias e três barras de macros refletem o consumo
- [ ] Copos de água somam e subtraem de 250 em 250

**Treino**
- [ ] Progresso por plano em séries concluídas / total
- [ ] Selo *Adaptado* conforme a lesão declarada
- [ ] Cronômetro de sessão inicia, pausa e zera
- [ ] Descanso com 60/90/120 s e alerta nos últimos 10 s
- [ ] Célula de série alterna e persiste
- [ ] Carga ajusta de 2,5 em 2,5 e registra
- [ ] Histórico mostra últimas seis cargas e delta

**Dieta**
- [ ] Agrupamento por tipo de refeição com total por grupo
- [ ] Remoção de item
- [ ] Busca com quantidade recalculando macros
- [ ] Registro manual e por áudio (simulado, rotulado)
- [ ] Sugestões rápidas
- [ ] Histórico de sete dias, ordenado corretamente na virada de mês

**Painel**
- [ ] Indicadores vêm dos dados reais, não de mock
- [ ] Lista e ficha de aluno
- [ ] Criar, editar e publicar plano
- [ ] Atribuir plano a aluno e ver refletido no app dele
- [ ] Pendências geradas e resolvidas pelos dados
- [ ] Identidade visual com preview ao vivo

**Transversal**
- [ ] Nenhum resquício da moldura de iPhone
- [ ] Tema escuro e claro em todas as telas
- [ ] Três marcas de demonstração aplicadas corretamente
- [ ] Todas as listas com os quatro estados
- [ ] Funciona de 320 px a desktop, sem rolagem horizontal
