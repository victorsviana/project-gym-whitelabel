import type { Gym, Role, Session, User } from '@gym/core';
import { createId } from '@gym/core';
import { gymRepository, userRepository } from '../../storage';
import { slugify } from './slugify';

function sessionFor(user: User): Session {
  return {
    userId: user.id,
    gymId: user.gymId,
    role: user.role,
    startedAt: new Date().toISOString(),
  };
}

function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '');
  return letters.join('') || '??';
}

export interface LoginMatch {
  gym: Gym;
  user: User;
}

export type LoginResult =
  | { status: 'success'; session: Session }
  | { status: 'invalid' }
  | { status: 'ambiguous'; matches: LoginMatch[] };

/**
 * A tela de login não pede a academia (e-mail é único só dentro dela, não globalmente — ver
 * MULTI-TENANCY.md). Busca em todas as academias por e-mail + papel + senha; se mais de uma bater
 * (caso Camila Reis), devolve as opções para o usuário escolher qual conta é a dele.
 */
export async function login(email: string, password: string, role: Role): Promise<LoginResult> {
  const gyms = await gymRepository.list();
  const candidates: LoginMatch[] = [];
  for (const gym of gyms) {
    const user = await userRepository.findByEmail(gym.id, email.trim());
    if (user && user.role === role && user.active && user.password === password) {
      candidates.push({ gym, user });
    }
  }

  if (candidates.length === 0) return { status: 'invalid' };
  if (candidates.length > 1) return { status: 'ambiguous', matches: candidates };
  return { status: 'success', session: sessionFor(candidates[0].user) };
}

export function loginAsUser(user: User): Session {
  return sessionFor(user);
}

export type RegisterResult = { status: 'success'; session: Session } | { status: 'email_taken' };

export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  gymId: string;
}

export async function registerStudent(input: RegisterStudentInput): Promise<RegisterResult> {
  const email = input.email.trim();
  const existing = await userRepository.findByEmail(input.gymId, email);
  if (existing) return { status: 'email_taken' };

  const user: User = {
    id: createId(),
    gymId: input.gymId,
    role: 'student',
    name: input.name.trim(),
    email,
    password: input.password,
    active: true,
    createdAt: new Date().toISOString(),
  };
  await userRepository.save(user);
  return { status: 'success', session: sessionFor(user) };
}

export type RegisterTrainerInput =
  | { mode: 'join'; name: string; email: string; password: string; gymId: string }
  | {
      mode: 'create';
      name: string;
      email: string;
      password: string;
      gymName: string;
      brand: string;
      brandFg: string;
      logo: string | null;
    };

async function createGymForTrainer(
  input: Extract<RegisterTrainerInput, { mode: 'create' }>,
): Promise<Gym> {
  const existingGyms = await gymRepository.list();
  const gym: Gym = {
    id: createId(),
    name: input.gymName.trim(),
    slug: slugify(input.gymName, (candidate) => existingGyms.some((g) => g.slug === candidate)),
    initials: initialsFrom(input.gymName),
    logo: input.logo,
    theme: { brand: input.brand, brandFg: input.brandFg, mode: 'dark' },
    createdAt: new Date().toISOString(),
  };
  await gymRepository.save(gym);
  return gym;
}

/** Professor se cadastrando: entra numa academia existente ou cria uma nova, vazia (MULTI-TENANCY.md). */
export async function registerTrainer(input: RegisterTrainerInput): Promise<RegisterResult> {
  const gym =
    input.mode === 'join' ? await gymRepository.findById(input.gymId) : await createGymForTrainer(input);
  if (!gym) {
    throw new Error('Academia não encontrada — selecione novamente na lista.');
  }

  const email = input.email.trim();
  const existing = await userRepository.findByEmail(gym.id, email);
  if (existing) return { status: 'email_taken' };

  const user: User = {
    id: createId(),
    gymId: gym.id,
    role: 'trainer',
    name: input.name.trim(),
    email,
    password: input.password,
    active: true,
    createdAt: new Date().toISOString(),
  };
  await userRepository.save(user);
  return { status: 'success', session: sessionFor(user) };
}
