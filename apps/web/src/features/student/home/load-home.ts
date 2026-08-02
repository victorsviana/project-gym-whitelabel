import type { BodyRegion, DailyGoal, IsoDate, Meal, NutritionTotals, WaterLog, WorkoutPlan } from '@gym/core';
import {
  computeStreak,
  countActiveDaysInMonth,
  getWeekdayIndex,
  isActiveDay,
  isAdaptedPlan,
  parseIsoDate,
  planOfDay,
  sumMealTotals,
} from '@gym/core';
import {
  activityRepository,
  nutritionRepository,
  studentRepository,
  userRepository,
  workoutRepository,
} from '../../../storage';

export interface TodayWorkout {
  plan: WorkoutPlan | null;
  trainerName: string | null;
  isAdapted: boolean;
}

/** Plano do dia pelo peso da semana, entre os planos publicados e atribuídos ao aluno. */
export async function loadTodayWorkout(
  gymId: string,
  studentId: string,
  injuries: readonly BodyRegion[],
  today: IsoDate,
): Promise<TodayWorkout> {
  const plans = await workoutRepository.listPlansForStudent(gymId, studentId);
  const plan = planOfDay(plans, getWeekdayIndex(today));
  if (!plan) return { plan: null, trainerName: null, isAdapted: false };

  const trainer = await userRepository.findById(gymId, plan.createdBy);
  return { plan, trainerName: trainer?.name ?? null, isAdapted: isAdaptedPlan(plan.exercises, injuries) };
}

export interface GoalProgress {
  goal: DailyGoal | null;
  consumed: NutritionTotals;
  water: WaterLog | null;
}

/** Metas e consumo de hoje — ring de calorias, barras de macro e hidratação. */
export async function loadGoalProgress(gymId: string, studentId: string, date: IsoDate): Promise<GoalProgress> {
  const [goal, meals, water] = await Promise.all([
    studentRepository.findGoal(gymId, studentId),
    nutritionRepository.listMeals(gymId, studentId, date),
    nutritionRepository.findWaterLog(gymId, studentId, date),
  ]);

  return { goal, consumed: sumMealTotals(meals), water };
}

export interface MonthActivity {
  activeDates: ReadonlySet<IsoDate>;
  streak: number;
  activeCount: number;
}

/** Dias ativos do mês atual (calendário) + o mês anterior (só para a sequência não cortar na virada). */
export async function loadMonthActivity(gymId: string, studentId: string, today: IsoDate): Promise<MonthActivity> {
  const { year, month } = parseIsoDate(today);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousMonthYear = month === 1 ? year - 1 : year;

  const [currentMonthDays, previousMonthDays] = await Promise.all([
    activityRepository.listByMonth(gymId, studentId, year, month),
    activityRepository.listByMonth(gymId, studentId, previousMonthYear, previousMonth),
  ]);

  const activeDates = new Set<IsoDate>();
  for (const day of [...currentMonthDays, ...previousMonthDays]) {
    if (isActiveDay(day.hasWorkout, day.hasMeal)) activeDates.add(day.date);
  }

  return {
    activeDates,
    streak: computeStreak(activeDates, today),
    activeCount: countActiveDaysInMonth(activeDates, today),
  };
}

export interface DayDetail {
  meals: Meal[];
  hasWorkout: boolean;
}

/** Extrato de um dia específico — aberto ao tocar numa célula do calendário. */
export async function loadDayDetail(gymId: string, studentId: string, date: IsoDate): Promise<DayDetail> {
  const { year, month } = parseIsoDate(date);
  const [meals, activityDays] = await Promise.all([
    nutritionRepository.listMeals(gymId, studentId, date),
    activityRepository.listByMonth(gymId, studentId, year, month),
  ]);

  const hasWorkout = activityDays.some((day) => day.date === date && day.hasWorkout);
  return { meals, hasWorkout };
}
