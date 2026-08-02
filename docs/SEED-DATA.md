# SEED-DATA.md — dados de demonstração

Três academias completas, criadas na primeira execução do app. Servem para desenvolver, testar o isolamento entre tenants e demonstrar o produto sem precisar cadastrar nada.

O seed é **idempotente**: rodar de novo não duplica. Existe uma ação de *restaurar dados de demonstração* que limpa e recria tudo.

**Senha de todas as contas: `demo1234`**

---

## Academia 1 — Gaviões Fitness

`slug: gavioes` · marca `#E4022E` vermelho, contraste `#FFFFFF`, tema escuro

### Professor
| Nome | E-mail |
|---|---|
| Douglas Moreira | `douglas@gavioes.com.br` |

### Alunos

| Nome | E-mail | Perfil | Situação |
|---|---|---|---|
| Victor Silva | `victor@aluno.com` | 29 a · 78 kg · 179 cm · massa · intermediário · 5 dias · sem lesão | Planos A–E, histórico de 6 semanas, sequência ativa |
| Rafael Dias | `rafael@aluno.com` | 27 a · 82 kg · 181 cm · performance · avançado · 6 dias · joelho | Planos A–E, pediu troca de treino → **pendência aberta** |
| Letícia Prado | `leticia@aluno.com` | 24 a · 59 kg · 162 cm · massa · iniciante · 3 dias · vegetariana | Planos A–C, histórico curto |
| Bruno Nunes | `bruno@aluno.com` | 38 a · 90 kg · 175 cm · secar · iniciante · 3 dias · ombro | **Sem nenhum plano atribuído** → pendência de aluno novo |
| Camila Reis | `camila@aluno.com` | 28 a · 66 kg · 170 cm · massa · intermediária · 4 dias | Planos A–D — *mesmo e-mail usado na Iron House, de propósito* |

### Planos
`A · Peito e Tríceps` · `B · Costas e Bíceps` · `C · Pernas completo` · `D · Ombro e Abdômen` · `E · Full body / Glúteo` · `F · Novo treino` (rascunho vazio, para exercitar o estado vazio)

Os exercícios dos planos A–E são os do protótipo. O plano D tem exercícios marcados com região sensível `ombro`, o que faz Bruno Nunes ver o selo *Adaptado* quando o plano for atribuído a ele.

---

## Academia 2 — Bluefit

`slug: bluefit` · marca `#2E7BFF` azul, contraste `#FFFFFF`, **tema claro**

### Professora
| Nome | E-mail |
|---|---|
| Renata Alves | `renata@bluefit.com.br` |

### Alunos

| Nome | E-mail | Perfil | Situação |
|---|---|---|---|
| Marina Costa | `marina@aluno.com` | 33 a · 64 kg · 166 cm · secar · intermediária · 4 dias · lombar · lactose | Planos A–C, histórico consistente |
| Thiago Marques | `thiago@aluno.com` | 31 a · 88 kg · 184 cm · massa · intermediário · 5 dias | Planos A–C |
| Ana Prado | `ana@aluno.com` | 26 a · 61 kg · 168 cm · performance · iniciante · 3 dias | **Sem plano** → pendência de aluno novo |

### Planos
`A · Superiores` · `B · Inferiores` · `C · Full body`

Esta academia existe principalmente para validar o **tema claro** e uma marca de cor oposta à da Gaviões. Se algum componente tiver cor fixa, aparece aqui primeiro.

---

## Academia 3 — Iron House

`slug: iron-house` · marca `#FF6B2C` laranja, contraste `#0A0B0A`, tema escuro

### Professor
| Nome | E-mail |
|---|---|
| Marcos Vieira | `marcos@ironhouse.com.br` |

### Alunos

| Nome | E-mail | Perfil | Situação |
|---|---|---|---|
| Camila Reis | `camila@aluno.com` | 30 a · 63 kg · 165 cm · performance · avançada · 5 dias | Planos A–D — *homônima e mesmo e-mail da aluna da Gaviões* |
| Diego Ramos | `diego@aluno.com` | 35 a · 95 kg · 178 cm · secar · avançado · 6 dias · ombro e lombar | Planos A–D, **avaliação com mais de 30 dias** → pendência de reavaliação |

### Planos
`A · Push` · `B · Pull` · `C · Legs` · `D · Condicionamento`

A cor de contraste desta academia é **preto sobre laranja** — o caso que revela componentes que assumem texto branco sobre a cor da marca.

---

## O que cada dado exercita

| Situação no seed | O que valida |
|---|---|
| Três marcas de cores muito distintas | Nenhuma cor fixa escapou para os componentes |
| Bluefit em tema claro | Tema claro em todas as telas |
| Iron House com contraste preto | Componentes que assumiam `text-white` sobre a marca |
| **Camila Reis com o mesmo e-mail em duas academias** | E-mail é único por academia, não globalmente; as duas contas são independentes e não se misturam |
| Bruno e Ana sem plano | Estado vazio do treino e pendência de aluno novo |
| Rafael com pedido de troca | Pendência de troca de treino |
| Diego com avaliação vencida | Pendência de reavaliação |
| Victor com 6 semanas de histórico | Gráfico de cargas, sequência longa, histórico de dieta |
| Letícia com histórico curto | Estados intermediários, gráfico com poucos pontos |
| Plano F vazio na Gaviões | Estado vazio de plano sem exercícios |
| Lesões de ombro, joelho e lombar | Selo *Adaptado* em cada região |
| Restrições vegetariana e lactose | Filtro de sugestões de dieta |

## Metas esperadas

Os perfis abaixo batem exatamente com os casos de teste de [`DOMAIN-RULES.md`](DOMAIN-RULES.md). São o jeito mais rápido de conferir, olhando a tela, se o cálculo está certo:

| Aluno | kcal | P | C | G | Água |
|---|---|---|---|---|---|
| Victor Silva (caso A) | 3000 | 156 | 455 | 62 | 3250 ml |
| Marina Costa (caso B) | 1720 | 141 | 174 | 51 | 2500 ml |
| Rafael Dias (caso C) | 3140 | 148 | 489 | 66 | 3250 ml |
| Letícia Prado (caso D) | 2000 | 118 | 276 | 47 | 2250 ml |

## Histórico gerado

O histórico não é aleatório — é gerado com forma, para as telas parecerem reais:

- **Cargas** crescentes com pequenas oscilações, para o gráfico e o delta mostrarem evolução positiva
- **Dias ativos** concentrados em dias úteis, com falhas ocasionais, formando uma sequência plausível
- **Refeições** distribuídas pelos cinco tipos, com total girando em torno da meta e alguns dias abaixo
- **Água** entre 60 % e 100 % da meta na maioria dos dias

O gerador é determinístico (semente fixa): dois desenvolvedores rodando o seed veem exatamente os mesmos números, o que torna capturas de tela e testes comparáveis.

## Modo demo

Em build de desenvolvimento, a tela de entrada tem um atalho de **modo demo**: lista todas as contas acima com papel e academia, e entra em qualquer uma com um toque, sem digitar senha. É o caminho para conferir o isolamento entre tenants em segundos.

## Roteiro de teste rápido

1. Entrar como **Douglas** (Gaviões) → confirmar que só aparecem os cinco alunos da Gaviões
2. Criar um plano novo, adicionar dois exercícios, atribuir a **Bruno Nunes**, publicar
3. Sair, entrar como **Bruno** → o treino está lá; a pendência de aluno novo sumiu do painel
4. Marcar algumas séries e registrar carga → voltar ao painel do Douglas e ver a atividade refletida
5. Entrar como **Renata** (Bluefit) → nenhum dado da Gaviões aparece, e o app está em tema claro e azul
6. Entrar como **Camila** na Gaviões e depois na Iron House → duas contas independentes, com treinos e histórico diferentes
