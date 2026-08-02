import { addDays, isSameMonth, type IsoDate } from '../dates';

export function isActiveDay(hasSetLog: boolean, hasMeal: boolean): boolean {
  return hasSetLog || hasMeal;
}

/**
 * Percorre os dias a partir de hoje, para trás, somando enquanto o dia for ativo.
 * Hoje ainda não ativo interrompe a contagem imediatamente.
 */
export function computeStreak(activeDates: ReadonlySet<IsoDate>, today: IsoDate): number {
  let streak = 0;
  let current = today;
  while (activeDates.has(current)) {
    streak += 1;
    current = addDays(current, -1);
  }
  return streak;
}

export function countActiveDaysInMonth(activeDates: ReadonlySet<IsoDate>, monthReference: IsoDate): number {
  let count = 0;
  for (const date of activeDates) {
    if (isSameMonth(date, monthReference)) count += 1;
  }
  return count;
}
