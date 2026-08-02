import { describe, expect, it } from 'vitest';
import { computeWorkoutProgress, isPlanComplete } from './workout-progress';

describe('computeWorkoutProgress', () => {
  it('calcula a fração de séries concluídas', () => {
    expect(computeWorkoutProgress(20, 10)).toBe(0.5);
  });

  it('é 0 quando o plano não tem séries', () => {
    expect(computeWorkoutProgress(0, 0)).toBe(0);
  });
});

describe('isPlanComplete', () => {
  it('é completo quando o progresso atinge 100%', () => {
    expect(isPlanComplete(1)).toBe(true);
    expect(isPlanComplete(0.9)).toBe(false);
  });
});
