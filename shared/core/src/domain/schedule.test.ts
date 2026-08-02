import { describe, expect, it } from 'vitest';
import { getWeekdayIndex, planOfDay, suggestMealType } from './schedule';

describe('getWeekdayIndex', () => {
  it('segunda é 0 e domingo é 6', () => {
    expect(getWeekdayIndex('2026-08-03')).toBe(0); // segunda-feira
    expect(getWeekdayIndex('2026-08-09')).toBe(6); // domingo
  });

  it('sábado é 1º de agosto de 2026', () => {
    expect(getWeekdayIndex('2026-08-01')).toBe(5);
  });
});

describe('planOfDay', () => {
  const plans = ['A', 'B', 'C'];

  it('usa o índice correspondente', () => {
    expect(planOfDay(plans, 1)).toBe('B');
  });

  it('usa o último quando há menos planos que dias', () => {
    expect(planOfDay(plans, 6)).toBe('C');
  });

  it('retorna null sem nenhum plano atribuído', () => {
    expect(planOfDay([], 0)).toBeNull();
  });
});

describe('suggestMealType', () => {
  it('sugere café da manhã até 09:59', () => {
    expect(suggestMealType(9, 59)).toBe('breakfast');
  });

  it('sugere almoço entre 10:00 e 13:59', () => {
    expect(suggestMealType(10, 0)).toBe('lunch');
    expect(suggestMealType(13, 59)).toBe('lunch');
  });

  it('sugere lanche entre 14:00 e 16:59', () => {
    expect(suggestMealType(14, 0)).toBe('snack');
  });

  it('sugere jantar entre 17:00 e 20:59', () => {
    expect(suggestMealType(17, 0)).toBe('dinner');
    expect(suggestMealType(20, 59)).toBe('dinner');
  });

  it('sugere ceia a partir das 21:00', () => {
    expect(suggestMealType(21, 0)).toBe('supper');
    expect(suggestMealType(23, 30)).toBe('supper');
  });
});
