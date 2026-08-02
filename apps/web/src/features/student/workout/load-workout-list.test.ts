import type { Gym, User, WorkoutPlan } from '@gym/core';
import { addDays, createId, todayIsoDate } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { executionRepository, gymRepository, userRepository, workoutRepository } from '../../../storage';
import { loadWorkoutList } from './load-workout-list';

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

describe('loadWorkoutList', () => {
  it('calcula progresso, conclusão e selo Adaptado a partir de dado real', async () => {
    const gym = buildGym();
    const trainer = buildTrainer(gym.id);
    const studentId = createId();
    await gymRepository.save(gym);
    await userRepository.save(trainer);

    const plan = buildPlan(gym.id, trainer.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [studentId], trainer.id);

    const today = todayIsoDate();
    const [supino, triceps] = plan.exercises;
    // Marca todas as séries de hoje -> plano completo.
    for (let setIndex = 0; setIndex < supino.sets; setIndex += 1) {
      await executionRepository.markSetLog({
        id: createId(),
        gymId: gym.id,
        studentId,
        planId: plan.id,
        exerciseId: supino.id,
        setIndex,
        date: today,
        completedAt: new Date().toISOString(),
      });
    }
    for (let setIndex = 0; setIndex < triceps.sets; setIndex += 1) {
      await executionRepository.markSetLog({
        id: createId(),
        gymId: gym.id,
        studentId,
        planId: plan.id,
        exerciseId: triceps.id,
        setIndex,
        date: today,
        completedAt: new Date().toISOString(),
      });
    }

    const list = await loadWorkoutList(gym.id, studentId, ['shoulder'], today);

    expect(list.rows).toHaveLength(1);
    const row = list.rows[0];
    expect(row.totalSets).toBe(5);
    expect(row.completedSets).toBe(5);
    expect(row.progress).toBe(1);
    expect(row.complete).toBe(true);
    expect(row.adapted).toBe(true); // supino sobrecarrega ombro, que está nas lesões

    expect(list.footer).toEqual({ trainerName: trainer.name, updatedAt: plan.updatedAt });
  });

  it('não conta séries marcadas em outro dia — o progresso reseta diariamente (DOMAIN-RULES.md#6)', async () => {
    const gym = buildGym();
    const trainer = buildTrainer(gym.id);
    const studentId = createId();
    await gymRepository.save(gym);
    await userRepository.save(trainer);

    const plan = buildPlan(gym.id, trainer.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [studentId], trainer.id);

    const today = todayIsoDate();
    const yesterday = addDays(today, -1);
    await executionRepository.markSetLog({
      id: createId(),
      gymId: gym.id,
      studentId,
      planId: plan.id,
      exerciseId: plan.exercises[0].id,
      setIndex: 0,
      date: yesterday,
      completedAt: new Date().toISOString(),
    });

    const list = await loadWorkoutList(gym.id, studentId, [], today);

    expect(list.rows[0].completedSets).toBe(0);
    expect(list.rows[0].complete).toBe(false);
  });

  it('sem plano atribuído, retorna lista e rodapé vazios', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    const list = await loadWorkoutList(gym.id, createId(), [], todayIsoDate());

    expect(list.rows).toEqual([]);
    expect(list.footer).toBeNull();
  });
});
