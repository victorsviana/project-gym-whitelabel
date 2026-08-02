import { beforeEach, describe, expect, it } from 'vitest';
import { createGymRepository } from './gym-repository';
import { createUserRepository } from './user-repository';
import { seedIfEmpty } from './seed';

beforeEach(() => {
  localStorage.clear();
});

describe('seedIfEmpty', () => {
  it('cria uma academia e um professor na primeira execução', async () => {
    await seedIfEmpty();

    const gyms = await createGymRepository().list();
    const trainers = await createUserRepository().listByGym(gyms[0].id, 'trainer');

    expect(gyms).toHaveLength(1);
    expect(trainers).toHaveLength(1);
  });

  it('é idempotente — rodar de novo não duplica nada', async () => {
    await seedIfEmpty();
    await seedIfEmpty();

    const gyms = await createGymRepository().list();
    expect(gyms).toHaveLength(1);
  });

  it('não roda se já existir alguma academia', async () => {
    const gymRepository = createGymRepository();
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
