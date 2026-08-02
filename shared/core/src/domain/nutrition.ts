import type { Meal } from '../types';

export interface NutritionTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function sumMealTotals(meals: readonly Pick<Meal, 'kcal' | 'protein' | 'carbs' | 'fat'>[]): NutritionTotals {
  return meals.reduce<NutritionTotals>(
    (totals, meal) => ({
      kcal: totals.kcal + meal.kcal,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function computeRemainingKcal(goalKcal: number, consumedKcal: number): number {
  return Math.max(0, goalKcal - consumedKcal);
}

/** Limitado a 100% apenas para exibição em barra; o consumido continua sendo exibido como está. */
export function computeProgress(consumed: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((consumed / goal) * 100));
}

export interface FoodMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** A base guarda valores por 100g; calcula proporcionalmente para a quantidade em gramas. */
export function computeFoodMacrosForQuantity(foodPer100g: FoodMacros, quantityGrams: number): FoodMacros {
  return {
    kcal: Math.round((foodPer100g.kcal * quantityGrams) / 100),
    protein: Math.round((foodPer100g.protein * quantityGrams) / 100),
    carbs: Math.round((foodPer100g.carbs * quantityGrams) / 100),
    fat: Math.round((foodPer100g.fat * quantityGrams) / 100),
  };
}
