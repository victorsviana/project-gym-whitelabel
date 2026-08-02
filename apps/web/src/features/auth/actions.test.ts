import type { Gym } from '@gym/core';
import { createId } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, userRepository } from '../../storage';
import { login, registerStudent, registerTrainer } from './actions';

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

describe('login', () => {
  it('autentica quando há só uma conta com aquele e-mail e papel', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    await registerStudent({ name: 'Ana', email: 'ana@aluno.com', password: 'demo1234', gymId: gym.id });

    const result = await login('ana@aluno.com', 'demo1234', 'student');

    expect(result.status).toBe('success');
  });

  it('recusa senha errada', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    await registerStudent({ name: 'Ana', email: 'ana@aluno.com', password: 'demo1234', gymId: gym.id });

    const result = await login('ana@aluno.com', 'senha-errada', 'student');

    expect(result.status).toBe('invalid');
  });

  it('não autentica papel diferente do cadastrado (professor não entra com login de aluno)', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    await registerTrainer({
      mode: 'join',
      name: 'Prof',
      email: 'prof@x.com',
      password: 'demo1234',
      gymId: gym.id,
    });

    const result = await login('prof@x.com', 'demo1234', 'student');

    expect(result.status).toBe('invalid');
  });

  it('pede para escolher a academia quando o e-mail existe em duas academias (caso Camila Reis)', async () => {
    const gymA = buildGym({ id: 'g1', slug: 'gavioes' });
    const gymB = buildGym({ id: 'g2', slug: 'iron-house' });
    await gymRepository.save(gymA);
    await gymRepository.save(gymB);
    await registerStudent({
      name: 'Camila (Gaviões)',
      email: 'camila@aluno.com',
      password: 'demo1234',
      gymId: gymA.id,
    });
    await registerStudent({
      name: 'Camila (Iron House)',
      email: 'camila@aluno.com',
      password: 'demo1234',
      gymId: gymB.id,
    });

    const result = await login('camila@aluno.com', 'demo1234', 'student');

    expect(result.status).toBe('ambiguous');
    if (result.status === 'ambiguous') {
      expect(result.matches.map((match) => match.gym.id).sort()).toEqual(['g1', 'g2']);
    }
  });
});

describe('registerStudent', () => {
  it('bloqueia e-mail já usado na mesma academia', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    await registerStudent({ name: 'Ana', email: 'ana@aluno.com', password: 'demo1234', gymId: gym.id });

    const second = await registerStudent({
      name: 'Ana 2',
      email: 'ana@aluno.com',
      password: 'demo1234',
      gymId: gym.id,
    });

    expect(second.status).toBe('email_taken');
  });

  it('permite o mesmo e-mail em academias diferentes', async () => {
    const gymA = buildGym({ id: 'g1', slug: 'a' });
    const gymB = buildGym({ id: 'g2', slug: 'b' });
    await gymRepository.save(gymA);
    await gymRepository.save(gymB);

    const first = await registerStudent({
      name: 'Camila',
      email: 'camila@aluno.com',
      password: 'demo1234',
      gymId: gymA.id,
    });
    const second = await registerStudent({
      name: 'Camila',
      email: 'camila@aluno.com',
      password: 'demo1234',
      gymId: gymB.id,
    });

    expect(first.status).toBe('success');
    expect(second.status).toBe('success');
  });
});

describe('registerTrainer', () => {
  it('cria uma academia nova e vazia ao escolher "criar"', async () => {
    const result = await registerTrainer({
      mode: 'create',
      name: 'Professora Nova',
      email: 'prof@nova.com',
      password: 'demo1234',
      gymName: 'Academia Nova',
      brand: '#2E7BFF',
      brandFg: '#FFFFFF',
      logo: null,
    });

    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    const gym = await gymRepository.findById(result.session.gymId);
    expect(gym?.name).toBe('Academia Nova');
    expect(gym?.slug).toBe('academia-nova');
    const users = await userRepository.listByGym(result.session.gymId);
    expect(users).toHaveLength(1);
  });

  it('gera slugs únicos quando duas academias novas têm o mesmo nome', async () => {
    await registerTrainer({
      mode: 'create',
      name: 'A',
      email: 'a@x.com',
      password: 'demo1234',
      gymName: 'Fit Club',
      brand: '#000000',
      brandFg: '#FFFFFF',
      logo: null,
    });
    const second = await registerTrainer({
      mode: 'create',
      name: 'B',
      email: 'b@x.com',
      password: 'demo1234',
      gymName: 'Fit Club',
      brand: '#000000',
      brandFg: '#FFFFFF',
      logo: null,
    });

    expect(second.status).toBe('success');
    if (second.status !== 'success') return;
    const gym = await gymRepository.findById(second.session.gymId);
    expect(gym?.slug).toBe('fit-club-2');
  });

  it('entra numa academia existente sem criar outra', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await registerTrainer({
      mode: 'join',
      name: 'Prof',
      email: 'prof@x.com',
      password: 'demo1234',
      gymId: gym.id,
    });

    expect(await gymRepository.list()).toHaveLength(1);
  });
});
