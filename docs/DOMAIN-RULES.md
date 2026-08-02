# DOMAIN-RULES.md — regras de negócio

Documento normativo. Todas as fórmulas abaixo vivem em `@gym/core/domain`, em funções puras, e valem igualmente para web, API e mobile. **Se um número calculado no app divergir deste documento, o app está errado.**

Origem: `prototype/extracted/logic.js`, método `computeMeta` e derivados.

---

## 1. Metas diárias de dieta

Calculadas ao fim do onboarding, a partir da avaliação do aluno. O aluno pode ajustá-las manualmente depois — o cálculo é o ponto de partida, não uma trava.

### 1.1 Entradas

| Campo | Tipo | Faixa |
|---|---|---|
| `sexo` | `homem` \| `mulher` | — |
| `idade` | anos | 14 a 90 |
| `peso` | kg | 35 a 220 |
| `altura` | cm | 130 a 220 |
| `objetivo` | `massa` \| `secar` \| `performance` | — |
| `dias` | treinos por semana | 1 a 7 |

### 1.2 Taxa metabólica basal (TMB)

Equação de **Mifflin-St Jeor**, arredondada para inteiro:

```
homem:   TMB = round(10·peso + 6,25·altura − 5·idade + 5)
mulher:  TMB = round(10·peso + 6,25·altura − 5·idade − 161)
```

### 1.3 Gasto energético total (TDEE)

```
fator = 1,375   se dias ≤ 3
        1,550   se dias ≤ 5
        1,725   se dias ≥ 6

TDEE = round(TMB × fator)
```

### 1.4 Calorias-alvo

```
ajuste = +0,10   se objetivo = massa
         −0,18   se objetivo = secar
          0,00   se objetivo = performance

kcal = round(TDEE × (1 + ajuste) ÷ 10) × 10
```

O arredondamento para múltiplo de 10 é intencional: meta redonda é mais fácil de acompanhar.

### 1.5 Macronutrientes

```
proteína (g) = round(peso × fatorProteína)
    fatorProteína = 2,2  se secar
                    2,0  se massa
                    1,8  se performance

gordura (g)  = round(peso × 0,8)

carboidrato (g) = max(0, round((kcal − proteína×4 − gordura×9) ÷ 4))
```

A proteína é maior no déficit para preservar massa magra; a gordura é fixa por kg; o carboidrato absorve o que sobrar das calorias.

### 1.6 Água

```
água (ml) = round((peso × 35 + extra) ÷ 250) × 250
    extra = 500  se dias ≥ 5
            250  se dias ≤ 4
```

O arredondamento para múltiplos de 250 ml existe porque a interface conta copos de 250 ml.

### 1.7 Ordem de arredondamento

Arredonde exatamente onde o documento manda. Acumular decimais e arredondar só no fim produz números diferentes, e a divergência aparece na tela.

Duas armadilhas de implementação:

- **Meio para cima, sempre.** `Math.round` do JavaScript arredonda `.5` para cima inclusive em negativos (`Math.round(-0,5) === -0`). As entradas aqui são todas positivas, então basta manter o comportamento padrão.
- **Carboidrato usa a proteína e a gordura já arredondadas**, não os valores brutos.

### 1.8 Casos de teste

Reproduza exatamente estes valores. São os testes de referência de `computeMeta`.

| Caso | Entrada | TMB | TDEE | Ajuste | kcal | P | C | G | Água |
|---|---|---|---|---|---|---|---|---|---|
| **A** | homem, 29 a, 78 kg, 179 cm, massa, 5 dias | 1759 | 2726 | +10 % | 3000 | 156 | 455 | 62 | 3250 ml |
| **B** | mulher, 33 a, 64 kg, 166 cm, secar, 4 dias | 1352 | 2096 | −18 % | 1720 | 141 | 174 | 51 | 2500 ml |
| **C** | homem, 27 a, 82 kg, 181 cm, performance, 6 dias | 1821 | 3141 | 0 % | 3140 | 148 | 489 | 66 | 3250 ml |
| **D** | mulher, 24 a, 59 kg, 162 cm, massa, 3 dias | 1322 | 1818 | +10 % | 2000 | 118 | 276 | 47 | 2250 ml |

---

## 2. Consumo do dia

```
consumido = soma de kcal, proteína, carboidrato e gordura de todas
            as refeições registradas na data de hoje

restante  = max(0, meta.kcal − consumido.kcal)
progresso = min(100, round(consumido ÷ meta × 100))
```

O progresso é limitado a 100 % apenas na barra; o valor consumido continua sendo exibido como está, mesmo acima da meta.

---

## 3. Macros de um alimento por quantidade

A base de alimentos guarda os valores **por 100 g**. Para uma quantidade `q` em gramas:

```
valor(q) = round(valorPor100g × q ÷ 100)
```

Aplicado independentemente a calorias, proteína, carboidrato e gordura.

*Exemplo:* peito de frango grelhado (165 kcal, 31 g P, 0 g C, 3,6 g G por 100 g) em 150 g → 248 kcal, 47 g P, 0 g C, 5 g G.

---

## 4. Água

```
adicionar copo:  água = min(meta.água, água + 250)
remover copo:    água = max(0, água − 250)

copos totais    = round(meta.água ÷ 250)
copos cheios    = round(água ÷ 250)
```

O consumo de água é diário: zera na virada do dia.

---

## 5. Constância e sequência

### 5.1 Dia ativo

Um dia é **ativo** quando houve atividade real registrada nele: pelo menos uma série marcada, ou pelo menos uma refeição registrada.

**Abrir o app não torna o dia ativo.** O protótipo marcava presença ao montar o componente, o que inflava artificialmente a sequência (defeito #4 da [auditoria](PROTOTYPE-AUDIT.md)).

### 5.2 Sequência (streak)

```
Percorra os dias a partir de hoje, para trás.
Enquanto o dia for ativo, some 1.
Pare no primeiro dia inativo.
```

Hoje ainda não ativo interrompe a contagem imediatamente — a sequência exibida é 0 até a primeira atividade do dia.

### 5.3 Dias ativos no mês

Contagem simples de dias ativos dentro do mês corrente.

---

## 6. Progresso de treino

```
total    = soma das séries de todos os exercícios do plano
concluído = quantas dessas séries foram marcadas hoje
progresso = concluído ÷ total          (0 quando total = 0)
plano completo = progresso ≥ 1
```

**O progresso é sempre relativo ao dia.** Séries marcadas ontem não contam para hoje; o plano reaparece zerado a cada dia (defeito #2 da auditoria).

---

## 7. Carga e evolução

### 7.1 Registro

A carga é registrada por **aluno + plano + exercício + data**, com um valor por dia — registrar de novo no mesmo dia sobrescreve.

Chavear apenas pelo nome do exercício, como no protótipo, faz o mesmo exercício em planos diferentes compartilhar histórico (defeito #3).

### 7.2 Ajuste

Incremento e decremento de **2,5 kg**, limitados a 0 e 500 kg, arredondados para o meio quilo mais próximo:

```
novo = clamp(0, 500, round(valor × 2) ÷ 2)
```

O valor inicial sugerido é a última carga registrada naquele exercício; se não houver histórico, 20 kg.

### 7.3 Evolução

```
delta = última carga − primeira carga registrada
```

Exibido com sinal, junto do gráfico das últimas seis cargas. Verde quando positivo, vermelho quando negativo, neutro quando zero.

---

## 8. Treino do dia

```
índice = (dia da semana, com segunda = 0) → segunda 0, terça 1, … domingo 6
plano do dia = planos atribuídos ao aluno, ordenados, no índice correspondente
               (se houver menos planos que dias, usa o último)
```

Se o aluno não tem nenhum plano atribuído, a Home mostra o estado vazio "seu professor ainda não montou seu treino" — situação real e esperada para aluno recém-cadastrado.

---

## 9. Exercício adaptado

Um exercício é marcado como **Adaptado** quando sobrecarrega uma região que o aluno declarou como lesionada no onboarding.

Na Fase 1 a relação é simples: o exercício carrega uma lista de regiões sensíveis (`ombro`, `joelho`, `lombar`, `punho`) e é marcado se qualquer uma delas estiver nas lesões do aluno. `nenhuma` não conta como lesão.

O plano inteiro recebe o selo se contiver ao menos um exercício adaptado.

---

## 10. Tipo de refeição por horário

Sugestão automática ao abrir o registro de alimento, pela hora local:

| Hora | Refeição sugerida |
|---|---|
| até 09:59 | Café da manhã |
| 10:00 – 13:59 | Almoço |
| 14:00 – 16:59 | Lanche |
| 17:00 – 20:59 | Jantar |
| 21:00 em diante | Ceia |

É apenas sugestão: o aluno pode trocar antes de salvar.

---

## 11. Datas

**Toda data de negócio é uma data local no formato ISO `YYYY-MM-DD`**, com zero à esquerda, sem horário e sem fuso.

O protótipo usava `ano-mês-dia` sem zero à esquerda (`2026-8-1`), o que quebra ordenação por string — `2026-8-9` fica depois de `2026-8-10` (defeito #1).

Regras:

- A chave do dia é gerada a partir da data **local** do dispositivo, nunca de UTC — senão o aluno que treina às 22h vê o registro cair no dia seguinte
- Comparação e ordenação de dias são comparação de strings, o que só funciona com o formato acima
- Timestamps de auditoria (`createdAt`, `updatedAt`) são ISO completos com fuso; não se confundem com a chave do dia
