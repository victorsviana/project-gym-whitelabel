import type { IsoDate } from '@gym/core';
import { compareIsoDate } from '@gym/core';
import { activityRepository } from '../../../storage';

/** Último dia com treino ou refeição registrada, olhando o mês atual e o anterior. */
export async function loadLastActivityDate(gymId: string, studentId: string): Promise<IsoDate | null> {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [currentMonthDays, previousMonthDays] = await Promise.all([
    activityRepository.listByMonth(gymId, studentId, currentYear, currentMonth),
    activityRepository.listByMonth(gymId, studentId, previousMonthYear, previousMonth),
  ]);

  let latest: IsoDate | null = null;
  for (const day of [...previousMonthDays, ...currentMonthDays]) {
    if (!day.hasWorkout && !day.hasMeal) continue;
    if (!latest || compareIsoDate(day.date, latest) > 0) latest = day.date;
  }

  return latest;
}
