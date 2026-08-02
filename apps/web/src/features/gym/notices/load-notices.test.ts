import type { Gym, StudentProfile, User, WorkoutPlan } from '@gym/core';
import { addDays, createId, todayIsoDate } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, noticeRepository, studentRepository, userRepository, workoutRepository } from '../../../storage';
import { loadOpenNotices, openNoticeStudentIds, resolvePlanChangeRequest } from './load-notices';

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

function buildStudent(gymId: string, overrides: Partial<User> = {}): User {
  return {
    id: createId(),
    gymId,
    role: 'student',
    name: 'Aluno Teste',
    email: 'aluno@teste.com',
    password: 'demo1234',
    active: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildPlan(gymId: string, overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: createId(),
    gymId,
    letter: 'A',
    name: 'Plano A',
    focus: 'Full body',
    weekday: 'Segunda',
    duration: '50 min',
    exercises: [],
    published: true,
    createdBy: 'prof-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildProfile(gymId: string, studentId: string, overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    studentId,
    gymId,
    sex: 'male',
    age: 28,
    weight: 80,
    height: 178,
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 5,
    injuries: [],
    restrictions: [],
    onboardedAt: new Date().toISOString(),
    lastAssessedAt: todayIsoDate(),
    ...overrides,
  };
}

describe('loadOpenNotices', () => {
  it('deriva new_student para aluno sem atribuição ativa', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Bruno Nunes' });
    await userRepository.save(student);

    const rows = await loadOpenNotices(gym.id);

    expect(rows).toEqual([
      expect.objectContaining({ kind: 'new_student', studentId: student.id, auto: true }),
    ]);
  });

  it('deriva reassessment para avaliação com mais de 30 dias, sem depender de registro seedado', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Diego Ramos' });
    await userRepository.save(student);
    await studentRepository.saveProfile(
      buildProfile(gym.id, student.id, { lastAssessedAt: addDays(todayIsoDate(), -45) }),
    );
    const plan = buildPlan(gym.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [student.id], 'prof-1');

    const rows = await loadOpenNotices(gym.id);

    expect(rows).toEqual([expect.objectContaining({ kind: 'reassessment', studentId: student.id })]);
  });

  it('resolver um plan_change_request some da fila, mas new_student continua até o plano ser atribuído', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Rafael Dias' });
    await userRepository.save(student);
    const notice = {
      id: createId(),
      gymId: gym.id,
      studentId: student.id,
      kind: 'plan_change_request' as const,
      text: 'Pediu troca de treino (dor no joelho)',
      resolved: false,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    await noticeRepository.save(notice);

    const before = await loadOpenNotices(gym.id);
    expect(before.map((row) => row.kind).sort()).toEqual(['new_student', 'plan_change_request']);

    await resolvePlanChangeRequest(gym.id, notice.id);

    const after = await loadOpenNotices(gym.id);
    expect(after.map((row) => row.kind)).toEqual(['new_student']);
  });

  it('atribuir um plano ao aluno faz new_student sumir sozinho, sem marcar nada como resolvido', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Bruno Nunes' });
    await userRepository.save(student);
    const plan = buildPlan(gym.id);
    await workoutRepository.savePlan(plan);

    expect(await loadOpenNotices(gym.id)).toEqual([
      expect.objectContaining({ kind: 'new_student', studentId: student.id }),
    ]);

    await workoutRepository.assign(gym.id, plan.id, [student.id], 'prof-1');

    expect(await loadOpenNotices(gym.id)).toEqual([]);
  });

  it('sem nenhuma pendência aberta, a fila fica vazia', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Victor Silva' });
    await userRepository.save(student);
    await studentRepository.saveProfile(buildProfile(gym.id, student.id));
    const plan = buildPlan(gym.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [student.id], 'prof-1');

    expect(await loadOpenNotices(gym.id)).toEqual([]);
  });
});

describe('openNoticeStudentIds', () => {
  it('retorna o conjunto de alunos com pendência aberta, derivada ou gravada', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Ana Prado' });
    await userRepository.save(student);

    const ids = await openNoticeStudentIds(gym.id);

    expect(ids.has(student.id)).toBe(true);
  });
});
