import type { User } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createUserRepository } from './user-repository';

beforeEach(() => {
  localStorage.clear();
});

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    gymId: 'gavioes',
    role: 'student',
    name: 'Aluno',
    email: 'aluno@exemplo.com',
    password: 'demo1234',
    active: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('UserRepository — isolamento por tenant', () => {
  it('o mesmo e-mail em duas academias não se mistura (caso Camila Reis)', async () => {
    const repo = createUserRepository();
    const email = 'camila@aluno.com';

    await repo.save(buildUser({ id: 'u-gavioes', gymId: 'gavioes', name: 'Camila (Gaviões)', email }));
    await repo.save(buildUser({ id: 'u-iron', gymId: 'iron-house', name: 'Camila (Iron House)', email }));

    expect((await repo.findByEmail('gavioes', email))?.id).toBe('u-gavioes');
    expect((await repo.findByEmail('iron-house', email))?.id).toBe('u-iron');
  });

  it('listByGym nunca devolve usuário de outra academia', async () => {
    const repo = createUserRepository();
    await repo.save(buildUser({ id: 'u1', gymId: 'gavioes' }));
    await repo.save(buildUser({ id: 'u2', gymId: 'bluefit' }));

    const usersOfGavioes = await repo.listByGym('gavioes');

    expect(usersOfGavioes).toHaveLength(1);
    expect(usersOfGavioes[0].id).toBe('u1');
  });

  it('filtra por papel quando informado', async () => {
    const repo = createUserRepository();
    await repo.save(buildUser({ id: 'aluno-1', gymId: 'gavioes', role: 'student' }));
    await repo.save(buildUser({ id: 'prof-1', gymId: 'gavioes', role: 'trainer' }));

    const trainers = await repo.listByGym('gavioes', 'trainer');

    expect(trainers.map((u) => u.id)).toEqual(['prof-1']);
  });
});

describe('UserRepository — sessão', () => {
  it('não há sessão até alguém entrar', async () => {
    const repo = createUserRepository();
    expect(await repo.getSession()).toBeNull();
  });

  it('inicia e encerra a sessão', async () => {
    const repo = createUserRepository();
    await repo.startSession({ userId: 'u1', gymId: 'gavioes', role: 'trainer', startedAt: new Date().toISOString() });

    expect((await repo.getSession())?.userId).toBe('u1');

    await repo.endSession();

    expect(await repo.getSession()).toBeNull();
  });
});
