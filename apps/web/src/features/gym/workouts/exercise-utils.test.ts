import type { PlanExercise, WorkoutPlan } from '@gym/core';
import { describe, expect, it } from 'vitest';
import { buildDuplicatePlan, reorderExercises, withExercise, withoutExercise } from './exercise-utils';

function buildExercise(overrides: Partial<PlanExercise> = {}): PlanExercise {
  return {
    id: 'ex-1',
    name: 'Supino reto',
    sets: 4,
    reps: '8–10',
    order: 0,
    sensitiveRegions: [],
    ...overrides,
  };
}

function buildPlan(overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: 'p1',
    gymId: 'gavioes',
    letter: 'A',
    name: 'Peito e Tríceps',
    focus: 'Peito',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [],
    published: true,
    createdBy: 'prof-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('reorderExercises', () => {
  it('troca de posição com o vizinho e renumera order', () => {
    const list = [buildExercise({ id: 'a', order: 0 }), buildExercise({ id: 'b', order: 1 })];

    const next = reorderExercises(list, 0, 1);

    expect(next.map((e) => e.id)).toEqual(['b', 'a']);
    expect(next.map((e) => e.order)).toEqual([0, 1]);
  });

  it('não faz nada ao tentar mover além dos limites', () => {
    const list = [buildExercise({ id: 'a' }), buildExercise({ id: 'b' })];

    expect(reorderExercises(list, 0, -1)).toBe(list);
    expect(reorderExercises(list, 1, 1)).toBe(list);
  });
});

describe('withExercise', () => {
  it('adiciona um exercício novo ao final', () => {
    const list = [buildExercise({ id: 'a' })];

    const next = withExercise(list, buildExercise({ id: 'b', name: 'Remada' }));

    expect(next.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('substitui o exercício existente pelo id, mantendo a posição', () => {
    const list = [buildExercise({ id: 'a', name: 'Supino' }), buildExercise({ id: 'b', name: 'Remada' })];

    const next = withExercise(list, buildExercise({ id: 'a', name: 'Supino inclinado' }));

    expect(next.map((e) => e.name)).toEqual(['Supino inclinado', 'Remada']);
  });
});

describe('withoutExercise', () => {
  it('remove pelo id e renumera order', () => {
    const list = [
      buildExercise({ id: 'a', order: 0 }),
      buildExercise({ id: 'b', order: 1 }),
      buildExercise({ id: 'c', order: 2 }),
    ];

    const next = withoutExercise(list, 'b');

    expect(next.map((e) => e.id)).toEqual(['a', 'c']);
    expect(next.map((e) => e.order)).toEqual([0, 1]);
  });
});

describe('buildDuplicatePlan', () => {
  it('gera novos ids para o plano e para cada exercício, e nasce como rascunho', () => {
    const plan = buildPlan({
      published: true,
      exercises: [buildExercise({ id: 'ex-1' }), buildExercise({ id: 'ex-2' })],
    });
    let counter = 0;
    const generateId = () => `novo-${++counter}`;

    const copy = buildDuplicatePlan(plan, generateId);

    expect(copy.id).toBe('novo-1');
    expect(copy.exercises.map((e) => e.id)).toEqual(['novo-2', 'novo-3']);
    expect(copy.name).toBe('Peito e Tríceps (cópia)');
    expect(copy.published).toBe(false);
    expect(copy.letter).toBe(plan.letter);
  });
});
