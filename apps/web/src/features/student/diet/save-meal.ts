import type { Food, IsoDate, Meal, MealType } from '@gym/core';
import { computeFoodMacrosForQuantity, createId } from '@gym/core';
import { nutritionRepository } from '../../../storage';
import { syncMealActivity } from './sync-meal-activity';

export interface ManualMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function buildSearchMeal(
  gymId: string,
  studentId: string,
  date: IsoDate,
  type: MealType,
  food: Food,
  quantity: number,
): Meal {
  const macros = computeFoodMacrosForQuantity(food, quantity);
  return {
    id: createId(),
    gymId,
    studentId,
    date,
    type,
    name: food.name,
    quantity,
    ...macros,
    source: 'search',
    createdAt: new Date().toISOString(),
  };
}

export function buildManualMeal(
  gymId: string,
  studentId: string,
  date: IsoDate,
  type: MealType,
  name: string,
  macros: ManualMacros,
  source: 'manual' | 'audio',
): Meal {
  return {
    id: createId(),
    gymId,
    studentId,
    date,
    type,
    name,
    ...macros,
    source,
    createdAt: new Date().toISOString(),
  };
}

/** Grava a refeição e sincroniza `ActivityDay.hasMeal` em seguida. */
export async function saveMealEntry(meal: Meal): Promise<void> {
  await nutritionRepository.saveMeal(meal);
  await syncMealActivity(meal.gymId, meal.studentId, meal.date);
}

export async function removeMealEntry(
  gymId: string,
  studentId: string,
  mealId: string,
  date: IsoDate,
): Promise<void> {
  await nutritionRepository.removeMeal(gymId, mealId);
  await syncMealActivity(gymId, studentId, date);
}
