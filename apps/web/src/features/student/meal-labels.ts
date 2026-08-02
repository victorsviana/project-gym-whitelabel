import type { MealType } from '@gym/core';

/** DOMAIN-RULES.md#10-tipo-de-refeição-por-horário. */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
  supper: 'Ceia',
};

export const MEAL_TYPE_ORDER: readonly MealType[] = [
  'breakfast',
  'lunch',
  'snack',
  'dinner',
  'supper',
];
