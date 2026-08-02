import type { IsoDate } from '@gym/core';
import { parseIsoDate } from '@gym/core';
import { activityRepository, executionRepository } from '../../../storage';

/**
 * Recalcula `ActivityDay.hasWorkout` a partir das séries realmente marcadas hoje neste plano
 * (DOMAIN-RULES.md#51-dia-ativo: "pelo menos uma série marcada") — não apaga o sinal de refeição
 * do mesmo dia, que outra feature (dieta) é dona.
 */
export async function syncWorkoutActivity(
  gymId: string,
  studentId: string,
  planId: string,
  date: IsoDate,
): Promise<void> {
  const { year, month } = parseIsoDate(date);
  const [setLogs, days] = await Promise.all([
    executionRepository.listSetLogs(gymId, studentId, planId, date),
    activityRepository.listByMonth(gymId, studentId, year, month),
  ]);
  const existing = days.find((day) => day.date === date);

  await activityRepository.save({
    gymId,
    studentId,
    date,
    hasWorkout: setLogs.length > 0,
    hasMeal: existing?.hasMeal ?? false,
  });
}
