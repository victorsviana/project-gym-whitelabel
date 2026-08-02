import type { IsoDate } from '../dates';
import { parseIsoDate } from '../dates';
import type { MealType } from '../types';

/** Segunda = 0, terça = 1, … domingo = 6. */
export function getWeekdayIndex(date: IsoDate): number {
  const { year, month, day } = parseIsoDate(date);
  const jsWeekday = new Date(year, month - 1, day).getDay(); // 0 = domingo
  return (jsWeekday + 6) % 7;
}

/** Planos ordenados no índice do dia; se houver menos planos que dias, usa o último. Sem planos, null. */
export function planOfDay<T>(orderedPlans: readonly T[], weekdayIndex: number): T | null {
  if (orderedPlans.length === 0) return null;
  const index = Math.min(weekdayIndex, orderedPlans.length - 1);
  return orderedPlans[index];
}

const MEAL_TYPE_BY_HOUR: readonly { untilHour: number; type: MealType }[] = [
  { untilHour: 10, type: 'breakfast' },
  { untilHour: 14, type: 'lunch' },
  { untilHour: 17, type: 'snack' },
  { untilHour: 21, type: 'dinner' },
];

/** Sugestão automática pela hora local; apenas ponto de partida, o aluno pode trocar. */
export function suggestMealType(hour: number, minute = 0): MealType {
  const totalMinutes = hour * 60 + minute;
  const match = MEAL_TYPE_BY_HOUR.find((entry) => totalMinutes < entry.untilHour * 60);
  return match?.type ?? 'supper';
}
