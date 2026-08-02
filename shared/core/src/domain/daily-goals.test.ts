import { describe, expect, it } from 'vitest';
import { computeDailyGoal, type DailyGoalInput } from './daily-goals';

// Casos de referência de DOMAIN-RULES.md §1.8 — reproduzir exatamente.
describe('computeDailyGoal', () => {
  it('caso A: homem, 29a, 78kg, 179cm, massa, 5 dias', () => {
    const input: DailyGoalInput = {
      sex: 'male',
      age: 29,
      weight: 78,
      height: 179,
      goal: 'muscle',
      daysPerWeek: 5,
    };

    expect(computeDailyGoal(input)).toEqual({
      bmr: 1759,
      tdee: 2726,
      kcal: 3000,
      protein: 156,
      carbs: 455,
      fat: 62,
      water: 3250,
    });
  });

  it('caso B: mulher, 33a, 64kg, 166cm, secar, 4 dias', () => {
    const input: DailyGoalInput = {
      sex: 'female',
      age: 33,
      weight: 64,
      height: 166,
      goal: 'cut',
      daysPerWeek: 4,
    };

    expect(computeDailyGoal(input)).toEqual({
      bmr: 1352,
      tdee: 2096,
      kcal: 1720,
      protein: 141,
      carbs: 174,
      fat: 51,
      water: 2500,
    });
  });

  it('caso C: homem, 27a, 82kg, 181cm, performance, 6 dias', () => {
    const input: DailyGoalInput = {
      sex: 'male',
      age: 27,
      weight: 82,
      height: 181,
      goal: 'performance',
      daysPerWeek: 6,
    };

    expect(computeDailyGoal(input)).toEqual({
      bmr: 1821,
      tdee: 3141,
      kcal: 3140,
      protein: 148,
      carbs: 489,
      fat: 66,
      water: 3250,
    });
  });

  it('caso D: mulher, 24a, 59kg, 162cm, massa, 3 dias', () => {
    const input: DailyGoalInput = {
      sex: 'female',
      age: 24,
      weight: 59,
      height: 162,
      goal: 'muscle',
      daysPerWeek: 3,
    };

    expect(computeDailyGoal(input)).toEqual({
      bmr: 1322,
      tdee: 1818,
      kcal: 2000,
      protein: 118,
      carbs: 276,
      fat: 47,
      water: 2250,
    });
  });
});
