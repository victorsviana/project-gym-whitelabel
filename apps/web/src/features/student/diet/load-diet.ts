import type { DailyGoal, Food, IsoDate, Meal, NutritionTotals } from '@gym/core';
import { addDays, sumMealTotals } from '@gym/core';
import { nutritionRepository, studentRepository } from '../../../storage';

export interface DietToday {
  goal: DailyGoal | null;
  meals: Meal[];
}

/** Refeições e meta de hoje — mesma dupla que `home/load-home.ts` já usa, isolada aqui para a tela de Dieta. */
export async function loadDietToday(gymId: string, studentId: string, date: IsoDate): Promise<DietToday> {
  const [goal, meals] = await Promise.all([
    studentRepository.findGoal(gymId, studentId),
    nutritionRepository.listMeals(gymId, studentId, date),
  ]);
  return { goal, meals };
}

export interface DietHistoryDay {
  date: IsoDate;
  totals: NutritionTotals;
  mealCount: number;
}

const HISTORY_DAYS = 7;

/**
 * Últimos 7 dias, hoje incluso, do mais antigo para o mais recente — `addDays` já atravessa
 * virada de mês sozinho, sem precisar do cuidado de mês atual + anterior que `loadMonthActivity` tem.
 */
export async function loadDietHistory(
  gymId: string,
  studentId: string,
  today: IsoDate,
): Promise<DietHistoryDay[]> {
  const from = addDays(today, -(HISTORY_DAYS - 1));
  const meals = await nutritionRepository.listMealsInRange(gymId, studentId, from, today);

  const days: DietHistoryDay[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const dayMeals = meals.filter((meal) => meal.date === date);
    days.push({ date, totals: sumMealTotals(dayMeals), mealCount: dayMeals.length });
  }
  return days;
}

/** Base única (global + da academia) — busca e sugestões rápidas leem daqui, corrigindo o defeito #7 de PROTOTYPE-AUDIT.md. */
export async function loadFoodBase(gymId: string): Promise<Food[]> {
  return nutritionRepository.listFoods(gymId);
}
