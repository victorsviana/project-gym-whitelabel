import { deriveAutoNoticeKinds, todayIsoDate } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createGymRepository } from './gym-repository';
import { createNoticeRepository } from './notice-repository';
import { createStudentRepository } from './student-repository';
import { createUserRepository } from './user-repository';
import { createWorkoutRepository } from './workout-repository';
import { restoreDemoData, seedIfEmpty } from './seed';

beforeEach(() => {
  localStorage.clear();
});

const gymRepository = createGymRepository();
const userRepository = createUserRepository();
const studentRepository = createStudentRepository();
const workoutRepository = createWorkoutRepository();
const noticeRepository = createNoticeRepository();

describe('seedIfEmpty', () => {
  it('cria as três academias de SEED-DATA.md, cada uma com professor e alunos', async () => {
    await seedIfEmpty();

    const gyms = await gymRepository.list();
    expect(gyms.map((gym) => gym.slug).sort()).toEqual(['bluefit', 'gavioes', 'iron-house']);

    for (const gym of gyms) {
      const trainers = await userRepository.listByGym(gym.id, 'trainer');
      const students = await userRepository.listByGym(gym.id, 'student');
      expect(trainers).toHaveLength(1);
      expect(students.length).toBeGreaterThan(0);
    }
  });

  it('é idempotente — rodar de novo não duplica nada', async () => {
    await seedIfEmpty();
    await seedIfEmpty();

    const gyms = await gymRepository.list();
    expect(gyms).toHaveLength(3);
  });

  it('não roda se já existir alguma academia', async () => {
    await gymRepository.save({
      id: 'existente',
      name: 'Já existia',
      slug: 'ja-existia',
      initials: 'JE',
      logo: null,
      theme: { brand: '#000000', brandFg: '#ffffff', mode: 'dark' },
      createdAt: new Date().toISOString(),
    });

    await seedIfEmpty();

    const gyms = await gymRepository.list();
    expect(gyms).toHaveLength(1);
    expect(gyms[0].id).toBe('existente');
  });
});

describe('restoreDemoData', () => {
  it('substitui qualquer dado salvo pelas três academias de demonstração', async () => {
    await gymRepository.save({
      id: 'lixo',
      name: 'Dado de teste',
      slug: 'lixo',
      initials: 'DT',
      logo: null,
      theme: { brand: '#000000', brandFg: '#ffffff', mode: 'dark' },
      createdAt: new Date().toISOString(),
    });

    await restoreDemoData();

    const gyms = await gymRepository.list();
    expect(gyms.map((gym) => gym.slug).sort()).toEqual(['bluefit', 'gavioes', 'iron-house']);
  });
});

describe('seedIfEmpty — isolamento entre tenants', () => {
  it('Camila Reis existe como duas contas independentes, uma na Gaviões e outra na Iron House', async () => {
    await seedIfEmpty();

    const gavioes = await gymRepository.findBySlug('gavioes');
    const ironHouse = await gymRepository.findBySlug('iron-house');
    expect(gavioes).not.toBeNull();
    expect(ironHouse).not.toBeNull();

    const camilaGavioes = await userRepository.findByEmail(gavioes!.id, 'camila@aluno.com');
    const camilaIronHouse = await userRepository.findByEmail(ironHouse!.id, 'camila@aluno.com');
    expect(camilaGavioes).not.toBeNull();
    expect(camilaIronHouse).not.toBeNull();
    expect(camilaGavioes!.id).not.toBe(camilaIronHouse!.id);

    const profileGavioes = await studentRepository.findProfile(gavioes!.id, camilaGavioes!.id);
    const profileIronHouse = await studentRepository.findProfile(ironHouse!.id, camilaIronHouse!.id);
    expect(profileGavioes!.age).toBe(28);
    expect(profileIronHouse!.age).toBe(30);

    const plansGavioes = await workoutRepository.listPlansForStudent(gavioes!.id, camilaGavioes!.id);
    const plansIronHouse = await workoutRepository.listPlansForStudent(ironHouse!.id, camilaIronHouse!.id);
    expect(plansGavioes.every((plan) => plan.gymId === gavioes!.id)).toBe(true);
    expect(plansIronHouse.every((plan) => plan.gymId === ironHouse!.id)).toBe(true);
  });
});

describe('seedIfEmpty — metas batem com os casos de teste de DOMAIN-RULES.md', () => {
  async function goalFor(gymSlug: string, email: string) {
    const gym = await gymRepository.findBySlug(gymSlug);
    const user = await userRepository.findByEmail(gym!.id, email);
    return studentRepository.findGoal(gym!.id, user!.id);
  }

  it('Victor Silva (caso A)', async () => {
    await seedIfEmpty();
    const goal = await goalFor('gavioes', 'victor@aluno.com');
    expect(goal).toMatchObject({ kcal: 3000, protein: 156, carbs: 455, fat: 62, water: 3250 });
  });

  it('Marina Costa (caso B)', async () => {
    await seedIfEmpty();
    const goal = await goalFor('bluefit', 'marina@aluno.com');
    expect(goal).toMatchObject({ kcal: 1720, protein: 141, carbs: 174, fat: 51, water: 2500 });
  });

  it('Rafael Dias (caso C)', async () => {
    await seedIfEmpty();
    const goal = await goalFor('gavioes', 'rafael@aluno.com');
    expect(goal).toMatchObject({ kcal: 3140, protein: 148, carbs: 489, fat: 66, water: 3250 });
  });

  it('Letícia Prado (caso D)', async () => {
    await seedIfEmpty();
    const goal = await goalFor('gavioes', 'leticia@aluno.com');
    expect(goal).toMatchObject({ kcal: 2000, protein: 118, carbs: 276, fat: 47, water: 2250 });
  });
});

describe('seedIfEmpty — pendências', () => {
  it('Bruno e Ana não têm nenhum plano atribuído', async () => {
    await seedIfEmpty();

    const gavioes = await gymRepository.findBySlug('gavioes');
    const bluefit = await gymRepository.findBySlug('bluefit');
    const bruno = await userRepository.findByEmail(gavioes!.id, 'bruno@aluno.com');
    const ana = await userRepository.findByEmail(bluefit!.id, 'ana@aluno.com');

    expect(await workoutRepository.listPlansForStudent(gavioes!.id, bruno!.id)).toHaveLength(0);
    expect(await workoutRepository.listPlansForStudent(bluefit!.id, ana!.id)).toHaveLength(0);
  });

  it('semeia a pendência de troca de treino de Rafael (SEED-DATA.md) — a única que não se deriva sozinha', async () => {
    await seedIfEmpty();

    const gavioes = await gymRepository.findBySlug('gavioes');
    const gavioesNotices = await noticeRepository.listByGym(gavioes!.id);

    expect(gavioesNotices.some((notice) => notice.kind === 'plan_change_request')).toBe(true);
  });

  it('não semeia new_student/reassessment como registro — F1-E15 deriva os dois em runtime', async () => {
    await seedIfEmpty();

    const gavioes = await gymRepository.findBySlug('gavioes');
    const bluefit = await gymRepository.findBySlug('bluefit');
    const ironHouse = await gymRepository.findBySlug('iron-house');

    const allNotices = [
      ...(await noticeRepository.listByGym(gavioes!.id)),
      ...(await noticeRepository.listByGym(bluefit!.id)),
      ...(await noticeRepository.listByGym(ironHouse!.id)),
    ];

    expect(allNotices.every((notice) => notice.kind === 'plan_change_request')).toBe(true);
  });

  it('a derivação (deriveAutoNoticeKinds) reproduz Bruno/Ana como new_student e Diego como reassessment', async () => {
    await seedIfEmpty();

    const gavioes = await gymRepository.findBySlug('gavioes');
    const bluefit = await gymRepository.findBySlug('bluefit');
    const ironHouse = await gymRepository.findBySlug('iron-house');
    const today = todayIsoDate();

    const bruno = await userRepository.findByEmail(gavioes!.id, 'bruno@aluno.com');
    const brunoAssignments = await workoutRepository.listAssignmentsForStudent(gavioes!.id, bruno!.id);
    const brunoProfile = await studentRepository.findProfile(gavioes!.id, bruno!.id);
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: brunoAssignments.some((a) => a.active),
        lastAssessedAt: brunoProfile!.lastAssessedAt,
        today,
      }),
    ).toContain('new_student');

    const ana = await userRepository.findByEmail(bluefit!.id, 'ana@aluno.com');
    const anaAssignments = await workoutRepository.listAssignmentsForStudent(bluefit!.id, ana!.id);
    const anaProfile = await studentRepository.findProfile(bluefit!.id, ana!.id);
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: anaAssignments.some((a) => a.active),
        lastAssessedAt: anaProfile!.lastAssessedAt,
        today,
      }),
    ).toContain('new_student');

    const diego = await userRepository.findByEmail(ironHouse!.id, 'diego@aluno.com');
    const diegoAssignments = await workoutRepository.listAssignmentsForStudent(ironHouse!.id, diego!.id);
    const diegoProfile = await studentRepository.findProfile(ironHouse!.id, diego!.id);
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: diegoAssignments.some((a) => a.active),
        lastAssessedAt: diegoProfile!.lastAssessedAt,
        today,
      }),
    ).toContain('reassessment');
  });
});

describe('seedIfEmpty — plano rascunho', () => {
  it('o plano F da Gaviões não tem exercícios e não aparece publicado', async () => {
    await seedIfEmpty();

    const gavioes = await gymRepository.findBySlug('gavioes');
    const plans = await workoutRepository.listPlans(gavioes!.id);
    const draft = plans.find((plan) => plan.letter === 'F');

    expect(draft).toBeDefined();
    expect(draft!.published).toBe(false);
    expect(draft!.exercises).toHaveLength(0);
  });
});
