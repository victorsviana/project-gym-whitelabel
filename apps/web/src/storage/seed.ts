import { createId, type Gym, type User } from '@gym/core';
import { createGymRepository } from './gym-repository';
import { createUserRepository } from './user-repository';

const gymRepository = createGymRepository();
const userRepository = createUserRepository();

/**
 * Garante uma academia e um professor mínimos na primeira execução, para o app não abrir
 * vazio antes do F1-E05 trazer o seed completo (três academias, alunos, planos, histórico).
 * Idempotente: só cria algo se ainda não existir nenhuma academia.
 */
export async function seedIfEmpty(): Promise<void> {
  const gyms = await gymRepository.list();
  if (gyms.length > 0) return;

  const now = new Date().toISOString();

  const gym: Gym = {
    id: createId(),
    name: 'Academia Demo',
    slug: 'demo',
    initials: 'AD',
    logo: null,
    theme: { brand: '#E4022E', brandFg: '#FFFFFF', mode: 'dark' },
    createdAt: now,
  };
  await gymRepository.save(gym);

  const trainer: User = {
    id: createId(),
    gymId: gym.id,
    role: 'trainer',
    name: 'Professor Demo',
    email: 'professor@demo.com',
    password: 'demo1234',
    active: true,
    createdAt: now,
  };
  await userRepository.save(trainer);
}
