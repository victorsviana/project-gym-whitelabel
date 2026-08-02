import { describe, expect, it } from 'vitest';
import { isAdaptedExercise, isAdaptedPlan } from './adapted-exercise';

describe('isAdaptedExercise', () => {
  it('é adaptado quando alguma região sensível está nas lesões do aluno', () => {
    expect(isAdaptedExercise(['shoulder', 'knee'], ['knee'])).toBe(true);
  });

  it('não é adaptado sem interseção', () => {
    expect(isAdaptedExercise(['shoulder'], ['knee'])).toBe(false);
  });

  it('não é adaptado sem nenhuma lesão declarada', () => {
    expect(isAdaptedExercise(['shoulder'], [])).toBe(false);
  });
});

describe('isAdaptedPlan', () => {
  it('recebe o selo se ao menos um exercício for adaptado', () => {
    const exercises = [{ sensitiveRegions: ['wrist'] as const }, { sensitiveRegions: ['knee'] as const }];
    expect(isAdaptedPlan(exercises, ['knee'])).toBe(true);
  });

  it('não recebe o selo se nenhum exercício for adaptado', () => {
    const exercises = [{ sensitiveRegions: ['wrist'] as const }];
    expect(isAdaptedPlan(exercises, ['knee'])).toBe(false);
  });
});
