import type { WorkoutPlan } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createWorkoutRepository } from './workout-repository';

beforeEach(() => {
  localStorage.clear();
});

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('WorkoutRepository — isolamento por tenant', () => {
  it('planos de uma academia não aparecem na listagem de outra', async () => {
    const repo = createWorkoutRepository();
    await repo.savePlan(buildPlan({ id: 'p-gavioes', gymId: 'gavioes' }));
    await repo.savePlan(buildPlan({ id: 'p-bluefit', gymId: 'bluefit' }));

    const gavioesPlans = await repo.listPlans('gavioes');

    expect(gavioesPlans).toHaveLength(1);
    expect(gavioesPlans[0].id).toBe('p-gavioes');
  });
});

describe('WorkoutRepository — atribuição', () => {
  it('aluno só vê planos publicados e atribuídos, na ordem em que foram atribuídos', async () => {
    const repo = createWorkoutRepository();
    await repo.savePlan(buildPlan({ id: 'p-a', letter: 'A' }));
    await repo.savePlan(buildPlan({ id: 'p-b', letter: 'B' }));
    await repo.savePlan(buildPlan({ id: 'p-draft', letter: 'F', published: false }));

    await repo.assign('gavioes', 'p-b', ['aluno-1'], 'prof-1');
    await repo.assign('gavioes', 'p-a', ['aluno-1'], 'prof-1');
    await repo.assign('gavioes', 'p-draft', ['aluno-1'], 'prof-1');

    const plans = await repo.listPlansForStudent('gavioes', 'aluno-1');

    expect(plans.map((p) => p.id)).toEqual(['p-b', 'p-a']);
  });

  it('desatribuir some da lista do aluno sem apagar o histórico da atribuição', async () => {
    const repo = createWorkoutRepository();
    await repo.savePlan(buildPlan({ id: 'p-a' }));
    await repo.assign('gavioes', 'p-a', ['aluno-1'], 'prof-1');

    const [assignment] = await repo.listAssignmentsForStudent('gavioes', 'aluno-1');
    await repo.unassign('gavioes', assignment.id);

    expect(await repo.listPlansForStudent('gavioes', 'aluno-1')).toHaveLength(0);
    expect(await repo.listAssignmentsForStudent('gavioes', 'aluno-1')).toHaveLength(1);
  });

  it('atribuir de novo ao mesmo aluno reativa em vez de duplicar a atribuição', async () => {
    const repo = createWorkoutRepository();
    await repo.savePlan(buildPlan({ id: 'p-a' }));
    await repo.assign('gavioes', 'p-a', ['aluno-1'], 'prof-1');
    const [{ id: assignmentId }] = await repo.listAssignmentsForStudent('gavioes', 'aluno-1');
    await repo.unassign('gavioes', assignmentId);

    await repo.assign('gavioes', 'p-a', ['aluno-1'], 'prof-1');

    const assignments = await repo.listAssignmentsForStudent('gavioes', 'aluno-1');
    expect(assignments).toHaveLength(1);
    expect(assignments[0].active).toBe(true);
  });
});
