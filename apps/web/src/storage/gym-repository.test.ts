import type { Gym } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createGymRepository } from './gym-repository';

beforeEach(() => {
  localStorage.clear();
});

function buildGym(overrides: Partial<Gym> = {}): Gym {
  return {
    id: 'g1',
    name: 'Gaviões Fitness',
    slug: 'gavioes',
    initials: 'GF',
    logo: null,
    theme: { brand: '#E4022E', brandFg: '#FFFFFF', mode: 'dark' },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('GymRepository', () => {
  it('salva e encontra por id e por slug', async () => {
    const repo = createGymRepository();
    await repo.save(buildGym());

    expect((await repo.findById('g1'))?.name).toBe('Gaviões Fitness');
    expect((await repo.findBySlug('gavioes'))?.id).toBe('g1');
    expect(await repo.findBySlug('inexistente')).toBeNull();
  });

  it('save é upsert — salvar de novo com o mesmo id substitui em vez de duplicar', async () => {
    const repo = createGymRepository();
    await repo.save(buildGym({ name: 'Gaviões Fitness' }));
    await repo.save(buildGym({ name: 'Gaviões Fitness (renomeado)' }));

    const gyms = await repo.list();

    expect(gyms).toHaveLength(1);
    expect(gyms[0].name).toBe('Gaviões Fitness (renomeado)');
  });
});
