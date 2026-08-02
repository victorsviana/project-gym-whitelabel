import type { Goal, Sex } from '../types';

const PROTEIN_FACTOR_BY_GOAL: Record<Goal, number> = {
  cut: 2.2,
  muscle: 2.0,
  performance: 1.8,
};

const KCAL_ADJUSTMENT_BY_GOAL: Record<Goal, number> = {
  muscle: 0.1,
  cut: -0.18,
  performance: 0,
};

const FAT_FACTOR_PER_KG = 0.8;
const WATER_ML_PER_KG = 35;
const WATER_EXTRA_ML_HIGH_FREQUENCY = 500;
const WATER_EXTRA_ML_LOW_FREQUENCY = 250;
const WATER_ROUNDING_ML = 250;
const KCAL_ROUNDING = 10;

export interface DailyGoalInput {
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  goal: Goal;
  daysPerWeek: number;
}

export interface ComputedDailyGoal {
  bmr: number;
  tdee: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

/** Mifflin-St Jeor. */
export function computeBmr(input: Pick<DailyGoalInput, 'sex' | 'age' | 'weight' | 'height'>): number {
  const base = 10 * input.weight + 6.25 * input.height - 5 * input.age;
  return Math.round(input.sex === 'male' ? base + 5 : base - 161);
}

function activityFactor(daysPerWeek: number): number {
  if (daysPerWeek <= 3) return 1.375;
  if (daysPerWeek <= 5) return 1.55;
  return 1.725;
}

export function computeTdee(bmr: number, daysPerWeek: number): number {
  return Math.round(bmr * activityFactor(daysPerWeek));
}

export function computeTargetKcal(tdee: number, goal: Goal): number {
  const adjusted = (tdee * (1 + KCAL_ADJUSTMENT_BY_GOAL[goal])) / KCAL_ROUNDING;
  return Math.round(adjusted) * KCAL_ROUNDING;
}

/** Percentual do ajuste de TDEE aplicado ao objetivo (10, -18 ou 0) — para exibição. */
export function kcalAdjustmentPct(goal: Goal): number {
  return Math.round(KCAL_ADJUSTMENT_BY_GOAL[goal] * 100);
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

/** Carboidrato usa a proteína e a gordura já arredondadas, não os valores brutos. */
export function computeMacros(kcal: number, weight: number, goal: Goal): Macros {
  const protein = Math.round(weight * PROTEIN_FACTOR_BY_GOAL[goal]);
  const fat = Math.round(weight * FAT_FACTOR_PER_KG);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { protein, carbs, fat };
}

export function computeWaterGoal(weight: number, daysPerWeek: number): number {
  const extra = daysPerWeek >= 5 ? WATER_EXTRA_ML_HIGH_FREQUENCY : WATER_EXTRA_ML_LOW_FREQUENCY;
  return Math.round((weight * WATER_ML_PER_KG + extra) / WATER_ROUNDING_ML) * WATER_ROUNDING_ML;
}

export function computeDailyGoal(input: DailyGoalInput): ComputedDailyGoal {
  const bmr = computeBmr(input);
  const tdee = computeTdee(bmr, input.daysPerWeek);
  const kcal = computeTargetKcal(tdee, input.goal);
  const { protein, carbs, fat } = computeMacros(kcal, input.weight, input.goal);
  const water = computeWaterGoal(input.weight, input.daysPerWeek);
  return { bmr, tdee, kcal, protein, carbs, fat, water };
}
