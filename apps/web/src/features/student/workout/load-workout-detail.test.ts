import type { Gym, User, WorkoutPlan } from '@gym/core';
import { addDays, createId, todayIsoDate } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { executionRepository, gymRepository, userRepository, workoutRepository } from '../../../storage';
import { loadWorkoutDetail } from './load-workout-detail';

beforeEach(() => {
  localStorage.clear();
});

function buildGym(overrides: Partial<Gym> = {}): Gym {
  return {
    id: createId(),
    name: 'Academia Teste',
    slug: 'academia-teste',
    initials: 'AT',
    logo: null,
    theme: { brand: '#E4022E', brandFg: '#FFFFFF', mode: 'dark' },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildTrainer(gymId: string, overrides: Partial<User> = {}): User {
  return {
    id: createId(),
    gymId,
    role: 'trainer',
    name: 'Douglas Prof',
    email: 'prof@teste.com',
    password: 'demo1234',
    active: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildPlan(gymId: string, createdBy: string, overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: createId(),
    gymId,
    letter: 'A',
    name: 'Peito e Tríceps',
    focus: 'Peito',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [
      { id: createId(), name: 'Supino reto', sets: 3, reps: '8-10', order: 0, sensitiveRegions: ['shoulder'] },
      { id: createId(), name: 'Tríceps corda', sets: 2, reps: '12', order: 1, sensitiveRegions: [] },
    ],
    published: true,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('loadWorkoutDetail', () => {
  it('monta os exercícios com séries de hoje, sugestão e delta de carga a partir do histórico', async () => {
    const gym = buildGym();
    const trainer = buildTrainer(gym.id);
    const studentId = createId();
    await gymRepository.save(gym);
    await userRepository.save(trainer);

    const plan = buildPlan(gym.id, trainer.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [studentId], trainer.id);

    const today = todayIsoDate();
    const [supino] = plan.exercises;

    await executionRepository.markSetLog({
      id: createId(),
      gymId: gym.id,
      studentId,
      planId: plan.id,
      exerciseId: supino.id,
      setIndex: 0,
      date: today,
      completedAt: new Date().toISOString(),
    });

    await executionRepository.saveLoadLog({
      id: createId(),
      gymId: gym.id,
      studentId,
      planId: plan.id,
      exerciseId: supino.id,
      date: addDays(today, -14),
      weight: 40,
      updatedAt: new Date().toISOString(),
    });
    await executionRepository.saveLoadLog({
      id: createId(),
      gymId: gym.id,
      studentId,
      planId: plan.id,
      exerciseId: supino.id,
      date: today,
      weight: 45,
      updatedAt: new Date().toISOString(),
    });

    const detail = await loadWorkoutDetail(gym.id, studentId, plan.id, ['shoulder'], today);

    expect(detail).not.toBeNull();
    expect(detail!.trainerName).toBe('Douglas Prof');
    const [supinoDetail, tricepsDetail] = detail!.exercises;

    expect(supinoDetail.adapted).toBe(true);
    expect(supinoDetail.completedSets.has(0)).toBe(true);
    expect(supinoDetail.completedSets.has(1)).toBe(false);
    expect(supinoDetail.suggestedLoad).toBe(45); // última carga registrada
    expect(supinoDetail.loadDelta).toBe(5); // 45 - 40

    expect(tricepsDetail.adapted).toBe(false);
    expect(tricepsDetail.completedSets.size).toBe(0);
    expect(tricepsDetail.suggestedLoad).toBe(20); // sem histórico -> padrão de load.ts
    expect(tricepsDetail.loadDelta).toBe(0);
  });

  it('retorna null para plano não atribuído/publicado ao aluno — não é permitido abrir a execução dele', async () => {
    const gym = buildGym();
    const trainer = buildTrainer(gym.id);
    const studentId = createId();
    await gymRepository.save(gym);
    await userRepository.save(trainer);

    const draftPlan = buildPlan(gym.id, trainer.id, { published: false });
    await workoutRepository.savePlan(draftPlan);
    await workoutRepository.assign(gym.id, draftPlan.id, [studentId], trainer.id);

    const unassignedPlan = buildPlan(gym.id, trainer.id);
    await workoutRepository.savePlan(unassignedPlan);

    const today = todayIsoDate();
    expect(await loadWorkoutDetail(gym.id, studentId, draftPlan.id, [], today)).toBeNull();
    expect(await loadWorkoutDetail(gym.id, studentId, unassignedPlan.id, [], today)).toBeNull();
    expect(await loadWorkoutDetail(gym.id, studentId, 'plano-inexistente', [], today)).toBeNull();
  });
});
