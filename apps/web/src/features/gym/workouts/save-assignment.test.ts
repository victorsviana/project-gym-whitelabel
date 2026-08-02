import type { WorkoutPlan } from '@gym/core';
import { createId } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { workoutRepository } from '../../../storage';
import { syncPlanAssignments, syncStudentAssignments } from './save-assignment';

beforeEach(() => {
  localStorage.clear();
});

function buildPlan(overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: createId(),
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

describe('syncPlanAssignments', () => {
  it('ativa quem entrou na seleção e desativa quem saiu, sem apagar o histórico', async () => {
    const plan = buildPlan();
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign('gavioes', plan.id, ['aluno-1'], 'prof-1');

    await syncPlanAssignments('gavioes', plan.id, ['aluno-2'], 'prof-1');

    const assignments = await workoutRepository.listAssignmentsForPlan('gavioes', plan.id);
    expect(assignments).toHaveLength(2);
    expect(assignments.find((a) => a.studentId === 'aluno-1')?.active).toBe(false);
    expect(assignments.find((a) => a.studentId === 'aluno-2')?.active).toBe(true);
  });

  it('mantém quem já estava ativo sem tocar na atribuição dele', async () => {
    const plan = buildPlan();
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign('gavioes', plan.id, ['aluno-1'], 'prof-1');
    const [original] = await workoutRepository.listAssignmentsForPlan('gavioes', plan.id);

    await syncPlanAssignments('gavioes', plan.id, ['aluno-1'], 'prof-1');

    const [after] = await workoutRepository.listAssignmentsForPlan('gavioes', plan.id);
    expect(after.id).toBe(original.id);
    expect(after.active).toBe(true);
  });
});

describe('syncStudentAssignments', () => {
  it('atribui os planos selecionados e desativa os que saíram da seleção do aluno', async () => {
    const planA = buildPlan({ letter: 'A' });
    const planB = buildPlan({ letter: 'B' });
    await workoutRepository.savePlan(planA);
    await workoutRepository.savePlan(planB);
    await workoutRepository.assign('gavioes', planA.id, ['aluno-1'], 'prof-1');

    await syncStudentAssignments('gavioes', 'aluno-1', [planB.id], 'prof-1');

    const assignments = await workoutRepository.listAssignmentsForStudent('gavioes', 'aluno-1');
    expect(assignments.find((a) => a.planId === planA.id)?.active).toBe(false);
    expect(assignments.find((a) => a.planId === planB.id)?.active).toBe(true);
  });
});
