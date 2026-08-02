import {
  addDays,
  computeFoodMacrosForQuantity,
  createId,
  decreaseLoad,
  getWeekdayIndex,
  increaseLoad,
  planOfDay,
  todayIsoDate,
  type ActivityDay,
  type IsoDate,
  type LoadLog,
  type Meal,
  type MealType,
  type Restriction,
  type SetLog,
  type WaterLog,
} from '@gym/core';
import { chance, createRng, pick, randomInt, type Rng } from './rng';
import type { SeedFood } from './foods';

export interface HistoryExercise {
  id: string;
  name: string;
  sets: number;
  /** Exercícios por tempo ("40s") não têm carga registrada. */
  isTimed: boolean;
}

export interface HistoryPlan {
  id: string;
  exercises: HistoryExercise[];
}

export interface HistoryFood extends SeedFood {
  id: string;
}

export interface StudentHistoryInput {
  gymId: string;
  studentId: string;
  seedKey: string;
  daysPerWeek: number;
  historyDays: number;
  /** Planos atribuídos, na ordem da atribuição — é o que `planOfDay` usa para o treino do dia. */
  assignedPlans: HistoryPlan[];
  goal: { kcal: number; water: number };
  restrictions: Restriction[];
  foods: HistoryFood[];
  /** Garante que hoje conte como dia ativo (usado só para o caso "sequência ativa" de SEED-DATA.md). */
  forceTodayActive?: boolean;
}

export interface StudentHistory {
  setLogs: SetLog[];
  loadLogs: LoadLog[];
  meals: Meal[];
  waterLogs: WaterLog[];
  activityDays: ActivityDay[];
}

const MEAL_SLOTS: readonly { type: MealType; weight: number; probability: number }[] = [
  { type: 'breakfast', weight: 0.22, probability: 1 },
  { type: 'lunch', weight: 0.32, probability: 1 },
  { type: 'snack', weight: 0.14, probability: 0.75 },
  { type: 'dinner', weight: 0.24, probability: 1 },
  { type: 'supper', weight: 0.08, probability: 0.35 },
];

const MEAL_SLOT_HOUR: Record<MealType, string> = {
  breakfast: '07:30:00.000Z',
  lunch: '12:30:00.000Z',
  snack: '15:30:00.000Z',
  dinner: '19:30:00.000Z',
  supper: '21:30:00.000Z',
};

function foodsAllowedFor(foods: readonly HistoryFood[], restrictions: readonly Restriction[]): HistoryFood[] {
  return foods.filter((food) => {
    if (restrictions.includes('vegan') && ['frango', 'patinho', 'ovo', 'leite', 'whey'].includes(food.slug)) {
      return false;
    }
    if (restrictions.includes('vegetarian') && ['frango', 'patinho'].includes(food.slug)) return false;
    if (restrictions.includes('lactose') && food.slug === 'leite') return false;
    return true;
  });
}

/** Escolhe até `daysPerWeek` dias da semana, priorizando dias úteis (segunda = 0 ... domingo = 6). */
function pickWorkoutWeekdays(daysPerWeek: number): Set<number> {
  const priorityOrder = [0, 1, 2, 3, 4, 5, 6];
  return new Set(priorityOrder.slice(0, daysPerWeek));
}

function nextLoad(rng: Rng, current: number): number {
  const roll = rng();
  if (roll < 0.65) return increaseLoad(current);
  if (roll < 0.75) return decreaseLoad(current);
  return current;
}

/**
 * Gera o histórico de um aluno com forma (cargas crescentes, dias ativos concentrados em dias
 * úteis, refeições em torno da meta, água entre 60–100 %), com semente determinística — a mesma
 * seed produz sempre os mesmos números, conforme SEED-DATA.md.
 */
export function generateStudentHistory(input: StudentHistoryInput): StudentHistory {
  const rng = createRng(input.seedKey);
  const today = todayIsoDate();
  const setLogs: SetLog[] = [];
  const loadLogs: LoadLog[] = [];
  const meals: Meal[] = [];
  const waterLogs: WaterLog[] = [];
  const activityDays: ActivityDay[] = [];

  if (input.historyDays <= 0) {
    return { setLogs, loadLogs, meals, waterLogs, activityDays };
  }

  const workoutWeekdays = pickWorkoutWeekdays(input.daysPerWeek);
  const allowedFoods = foodsAllowedFor(input.foods, input.restrictions);
  const lastWeightByExercise = new Map<string, number>();

  for (let offset = input.historyDays - 1; offset >= 0; offset -= 1) {
    const date: IsoDate = addDays(today, -offset);
    const weekdayIndex = getWeekdayIndex(date);
    const isToday = offset === 0;

    const isScheduledWorkoutDay = input.assignedPlans.length > 0 && workoutWeekdays.has(weekdayIndex);
    const isWorkoutDay = isScheduledWorkoutDay && chance(rng, 0.85);

    let hasWorkout = false;
    if (isWorkoutDay) {
      const plan = planOfDay(input.assignedPlans, weekdayIndex);
      if (plan) {
        hasWorkout = true;
        for (const exercise of plan.exercises) {
          for (let setIndex = 0; setIndex < exercise.sets; setIndex += 1) {
            setLogs.push({
              id: createId(),
              gymId: input.gymId,
              studentId: input.studentId,
              planId: plan.id,
              exerciseId: exercise.id,
              setIndex,
              date,
              completedAt: `${date}T18:30:00.000Z`,
            });
          }

          if (exercise.isTimed) continue;

          const previous = lastWeightByExercise.get(exercise.id);
          const weight =
            previous === undefined ? Math.round(randomInt(rng, 8, 24) / 2.5) * 2.5 : nextLoad(rng, previous);
          lastWeightByExercise.set(exercise.id, weight);

          loadLogs.push({
            id: createId(),
            gymId: input.gymId,
            studentId: input.studentId,
            planId: plan.id,
            exerciseId: exercise.id,
            date,
            weight,
            updatedAt: `${date}T18:30:00.000Z`,
          });
        }
      }
    }

    let hasMeal = false;
    const logMealsToday = chance(rng, 0.9) || (isToday && input.forceTodayActive);
    if (logMealsToday && allowedFoods.length > 0) {
      const dayFactor = randomInt(rng, 80, 105) / 100;
      const targetKcal = Math.round(input.goal.kcal * dayFactor);

      const includedSlots = MEAL_SLOTS.filter((slot) => chance(rng, slot.probability));
      const weightSum = includedSlots.reduce((sum, slot) => sum + slot.weight, 0);

      for (const slot of includedSlots) {
        const slotKcal = Math.round((targetKcal * slot.weight) / weightSum);
        const food = pick(rng, allowedFoods);
        const quantity = Math.min(400, Math.max(20, Math.round((slotKcal / food.kcal) * 100 / 10) * 10));
        const macros = computeFoodMacrosForQuantity(food, quantity);

        meals.push({
          id: createId(),
          gymId: input.gymId,
          studentId: input.studentId,
          date,
          type: slot.type,
          name: `${food.name} (${quantity}g)`,
          quantity,
          kcal: macros.kcal,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          source: 'search',
          createdAt: `${date}T${MEAL_SLOT_HOUR[slot.type]}`,
        });
        hasMeal = true;
      }
    }

    if (chance(rng, 0.9)) {
      const fraction = randomInt(rng, 60, 100) / 100;
      const amount = Math.min(input.goal.water, Math.round((input.goal.water * fraction) / 250) * 250);
      waterLogs.push({ gymId: input.gymId, studentId: input.studentId, date, amount });
    }

    if (hasWorkout || hasMeal) {
      activityDays.push({ gymId: input.gymId, studentId: input.studentId, date, hasWorkout, hasMeal });
    }
  }

  return { setLogs, loadLogs, meals, waterLogs, activityDays };
}
