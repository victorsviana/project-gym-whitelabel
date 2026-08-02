import type { IsoDate } from '@gym/core';
import { parseIsoDate } from '@gym/core';
import { activityRepository, nutritionRepository } from '../../../storage';

/**
 * Recalcula `ActivityDay.hasMeal` a partir das refeições de fato registradas hoje
 * (DOMAIN-RULES.md §5.1) — não mexe em `hasWorkout`, que `workout/sync-activity.ts` é dono.
 */
export async function syncMealActivity(gymId: string, studentId: string, date: IsoDate): Promise<void> {
  const { year, month } = parseIsoDate(date);
  const [meals, days] = await Promise.all([
    nutritionRepository.listMeals(gymId, studentId, date),
    activityRepository.listByMonth(gymId, studentId, year, month),
  ]);
  const existing = days.find((day) => day.date === date);

  await activityRepository.save({
    gymId,
    studentId,
    date,
    hasWorkout: existing?.hasWorkout ?? false,
    hasMeal: meals.length > 0,
  });
}
