import { describe, expect, it } from 'vitest';
import { computeFoodMacrosForQuantity, computeProgress, computeRemainingKcal, sumMealTotals } from './nutrition';

describe('sumMealTotals', () => {
  it('soma kcal e macros de todas as refeições', () => {
    const meals = [
      { kcal: 300, protein: 20, carbs: 30, fat: 10 },
      { kcal: 500, protein: 40, carbs: 50, fat: 15 },
    ];

    expect(sumMealTotals(meals)).toEqual({ kcal: 800, protein: 60, carbs: 80, fat: 25 });
  });

  it('retorna zero para lista vazia', () => {
    expect(sumMealTotals([])).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('computeRemainingKcal', () => {
  it('não fica negativo quando o consumo passa da meta', () => {
    expect(computeRemainingKcal(2000, 2500)).toBe(0);
  });

  it('calcula o restante normalmente', () => {
    expect(computeRemainingKcal(2000, 1200)).toBe(800);
  });
});

describe('computeProgress', () => {
  it('limita a 100% quando o consumo ultrapassa a meta', () => {
    expect(computeProgress(2500, 2000)).toBe(100);
  });

  it('calcula o percentual normalmente', () => {
    expect(computeProgress(1000, 2000)).toBe(50);
  });

  it('retorna 0 quando a meta é 0', () => {
    expect(computeProgress(100, 0)).toBe(0);
  });
});

describe('computeFoodMacrosForQuantity', () => {
  it('peito de frango grelhado em 150g', () => {
    const per100g = { kcal: 165, protein: 31, carbs: 0, fat: 3.6 };
    expect(computeFoodMacrosForQuantity(per100g, 150)).toEqual({ kcal: 248, protein: 47, carbs: 0, fat: 5 });
  });
});
