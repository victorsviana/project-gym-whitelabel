# DATA-MODEL.md — modelo de dados

Entidades, relacionamentos e o formato de armazenamento em cada fase. Os tipos canônicos vivem em `@gym/core/types` — este documento explica; o código define.

## Visão geral

```
Gym (academia, o tenant)
 ├── User (professor)
 ├── User (aluno) ── StudentProfile ── DailyGoal
 │                     ├── SetLog        séries marcadas
 │                     ├── LoadLog       cargas registradas
 │                     ├── Meal          refeições
 │                     ├── WaterLog      hidratação
 │                     └── ActivityDay   dias ativos
 ├── WorkoutPlan ── PlanExercise
 │      └── Assignment  (plano ↔ aluno)
 ├── Food (base de alimentos)
 └── Notice (pendências do painel)
```

**Regra invariante:** toda entidade carrega `gymId`. As que pertencem a um aluno carregam também `studentId`. Não existe consulta sem escopo de tenant.

---

## Entidades

### Gym
A academia. É o tenant.

| Campo | Tipo | Nota |
|---|---|---|
| `id` | string | |
| `name` | string | "Gaviões Fitness" |
| `slug` | string | único; vira subdomínio na Fase 2 |
| `initials` | string | fallback quando não há logo |
| `logo` | string \| null | data URL na Fase 1, URL de object storage na Fase 2 |
| `theme` | `GymTheme` | ver [`WHITELABEL.md`](WHITELABEL.md) |
| `createdAt` | ISO datetime | |

### User
Conta de acesso. Um usuário pertence a exatamente uma academia.

| Campo | Tipo | Nota |
|---|---|---|
| `id` | string | |
| `gymId` | string | |
| `role` | `student` \| `trainer` | Fase 2 acrescenta `gym_admin` e `distributor` |
| `name`, `email` | string | e-mail único **dentro da academia** |
| `password` | string | Fase 1: mockado, guardado em claro. Fase 2: hash argon2 |
| `active` | boolean | |
| `createdAt` | ISO datetime | |

Na Fase 1 a senha é mockada e não protege nada — os dados estão no `localStorage` do próprio navegador. Isso é aceitável porque não há dado real de terceiros; na Fase 2 vira autenticação de verdade.

### StudentProfile
A avaliação inicial do aluno e o que dela deriva.

| Campo | Tipo | Nota |
|---|---|---|
| `studentId`, `gymId` | string | |
| `sex` | `male` \| `female` | usado só no cálculo de TMB |
| `age`, `weight`, `height` | number | anos, kg, cm |
| `goal` | `muscle` \| `cut` \| `performance` | |
| `level` | `beginner` \| `intermediate` \| `advanced` | |
| `daysPerWeek` | 1–7 | |
| `injuries` | `BodyRegion[]` | `shoulder` \| `knee` \| `lower_back` \| `wrist` |
| `restrictions` | string[] | `lactose` \| `gluten` \| `vegetarian` \| `vegan` |
| `onboardedAt` | ISO datetime \| null | null = onboarding pendente |

### DailyGoal
Metas do aluno. Nascem do cálculo e podem ser ajustadas manualmente.

`studentId` · `gymId` · `kcal` · `protein` · `carbs` · `fat` · `water` (ml) · `source: computed | manual` · `updatedAt`

Guardar a origem importa: se o aluno mudar de peso e as metas forem `computed`, elas podem ser recalculadas; se forem `manual`, não devem ser sobrescritas sem aviso.

### WorkoutPlan
Um treino da academia (o "Treino A"). Pertence à academia, não ao aluno.

| Campo | Tipo | Nota |
|---|---|---|
| `id`, `gymId` | string | |
| `letter` | string | "A", "B", … |
| `name` | string | "Peito e Tríceps" |
| `focus`, `weekday`, `duration` | string | rótulos livres exibidos na lista |
| `exercises` | `PlanExercise[]` | ordenados |
| `published` | boolean | rascunho não aparece para o aluno |
| `createdBy` | string | id do professor |
| `createdAt`, `updatedAt` | ISO datetime | |

### PlanExercise

`id` · `name` · `sets` (number) · `reps` (string, aceita "8–10" e "40s") · `order` · `sensitiveRegions: BodyRegion[]` · `notes?`

`reps` é texto de propósito: o protótipo já usa faixas e tempo, e forçar número perderia informação.

### Assignment
O vínculo que faz o treino aparecer para o aluno. **É aqui que os dois perfis se encontram.**

`id` · `gymId` · `planId` · `studentId` · `order` · `active` · `assignedAt` · `assignedBy`

Um plano pode ser atribuído a vários alunos; um aluno pode ter vários planos. Desativar a atribuição some com o treino da lista do aluno sem apagar o histórico.

### SetLog
Uma série marcada como concluída.

`id` · `gymId` · `studentId` · `planId` · `exerciseId` · `setIndex` · `date` (`YYYY-MM-DD`) · `completedAt`

A data faz parte da chave: é o que garante que o progresso reseta a cada dia.

### LoadLog
A carga usada em um exercício, um registro por dia.

`id` · `gymId` · `studentId` · `planId` · `exerciseId` · `date` · `weight` (kg) · `updatedAt`

Chave lógica única: `studentId + planId + exerciseId + date`. Registrar de novo no mesmo dia sobrescreve.

### Meal
Uma refeição registrada.

`id` · `gymId` · `studentId` · `date` · `type` (`breakfast` \| `lunch` \| `snack` \| `dinner` \| `supper`) · `name` · `quantity?` (g) · `kcal` · `protein` · `carbs` · `fat` · `source` (`search` \| `manual` \| `audio`) · `createdAt`

Os macros são gravados já calculados. Se a base de alimentos mudar depois, o histórico do aluno não muda junto — comportamento desejado.

### Food
Base de alimentos, valores **por 100 g**.

`id` · `gymId \| null` (null = base global) · `name` · `kcal` · `protein` · `carbs` · `fat` · `defaultQuantity`

Base única. O protótipo tinha duas listas paralelas (defeito #7 da [auditoria](PROTOTYPE-AUDIT.md)); as "sugestões rápidas" passam a ser porções pré-definidas sobre esta mesma base.

### WaterLog
`gymId` · `studentId` · `date` · `amount` (ml). Um registro por dia.

### ActivityDay
Cache de constância, derivado de `SetLog` e `Meal`.

`gymId` · `studentId` · `date` · `hasWorkout` · `hasMeal`

É dado derivado: pode ser recalculado a qualquer momento a partir dos logs. Existe por desempenho do calendário e da sequência.

### Notice
Pendência do painel da academia.

`id` · `gymId` · `studentId` · `kind` (`new_student` \| `plan_change_request` \| `reassessment`) · `text` · `resolved` · `createdAt` · `resolvedAt`

Na Fase 1 as pendências são **derivadas dos dados**, não digitadas: aluno sem atribuição ativa gera `new_student`; avaliação com mais de 30 dias gera `reassessment`. Resolver a causa resolve a pendência.

### Session
Sessão local. Não é entidade de negócio, mas persiste.

`userId` · `gymId` · `role` · `startedAt`

---

## Armazenamento na Fase 1 — `localStorage`

Chave única `gymapp:v1`, com envelope versionado:

```jsonc
{
  "version": 1,
  "updatedAt": "2026-08-01T18:00:00.000Z",
  "data": {
    "gyms":       [ /* Gym */ ],
    "users":      [ /* User */ ],
    "profiles":   [ /* StudentProfile */ ],
    "goals":      [ /* DailyGoal */ ],
    "plans":      [ /* WorkoutPlan com exercises embutidos */ ],
    "assignments":[ /* Assignment */ ],
    "setLogs":    [ /* SetLog */ ],
    "loadLogs":   [ /* LoadLog */ ],
    "meals":      [ /* Meal */ ],
    "waterLogs":  [ /* WaterLog */ ],
    "activity":   [ /* ActivityDay */ ],
    "notices":    [ /* Notice */ ],
    "foods":      [ /* Food */ ]
  }
}
```

A sessão fica separada, em `gymapp:session`, para que limpar dados de demonstração não derrube o login.

**Coleções planas, não aninhadas por academia.** Índices por `gymId` são construídos em memória na leitura. Aninhar economizaria filtro, mas afastaria o formato do relacional da Fase 2 sem ganho real nesta escala.

### Migração de schema

Toda leitura passa pelo migrador:

```
version gravada < version do código
  → aplica as migrações em ordem, grava a nova versão
version gravada > version do código
  → o app avisa e oferece restaurar os dados de demonstração
```

Migração é função pura `(data, fromVersion) => data`, testável e versionada junto do código. Nunca altere o formato sem escrever a migração — dados de teste também têm valor.

### Limites

`localStorage` gira em torno de 5 MB por origem. O consumo real é pequeno, com uma exceção: **o logo da academia em data URL**. Limitar o upload a ~200 KB e redimensionar antes de salvar.

---

## Fase 2 — PostgreSQL

Cada entidade acima vira uma tabela, com estas mudanças:

| Mudança | Motivo |
|---|---|
| `PlanExercise` vira tabela própria com FK para `workout_plan` | Permite catálogo de exercícios reaproveitável |
| Nova tabela `exercise` (catálogo por academia) | Hoje o exercício é texto livre digitado pelo professor |
| Nova tabela `assessment` | Histórico de avaliações, não só a inicial |
| Nova tabela `workout_session` | Agrupa `set_log` e `load_log` em uma sessão com início e fim |
| `push_subscription`, `audit_log` | Web Push e auditoria |
| `activity_day` vira view materializada | É dado derivado |
| `user.password` vira hash argon2 | Autenticação real |

**Multi-tenancy:** `gym_id` em toda tabela, índice composto começando por `gym_id`, e Row Level Security como segunda barreira além do filtro da aplicação.

**Importação da Fase 1:** no primeiro login o app oferece enviar o conteúdo do `localStorage` para a conta. O endpoint valida, remapeia ids locais para ids do servidor e é idempotente — importar duas vezes não duplica nada.
