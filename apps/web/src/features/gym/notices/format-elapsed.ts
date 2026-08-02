import type { IsoDate } from '@gym/core';
import { daysBetween } from '@gym/core';

/** "Hoje" / "Ontem" / "há N dias" — tempo decorrido desde `since` (UI-SPEC.md#avisos). */
export function formatElapsed(since: IsoDate, today: IsoDate): string {
  const days = daysBetween(since, today);
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  return `há ${days} dias`;
}
