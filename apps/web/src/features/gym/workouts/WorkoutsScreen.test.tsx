import type { Gym, User, WorkoutPlan } from '@gym/core';
import { createId } from '@gym/core';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, userRepository, workoutRepository } from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { WorkoutsScreen } from './WorkoutsScreen';

beforeEach(() => {
  localStorage.clear();
  useSessionStore.setState({ session: null });
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

function buildTrainer(gymId: string): User {
  return {
    id: createId(),
    gymId,
    role: 'trainer',
    name: 'Professor',
    email: 'prof@x.com',
    password: 'demo1234',
    active: true,
    createdAt: new Date().toISOString(),
  };
}

function buildPlan(gymId: string, overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: createId(),
    gymId,
    letter: 'A',
    name: 'Peito e Tríceps',
    focus: 'Peito',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [],
    published: true,
    createdBy: 'prof-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

async function renderAsTrainerOf(gym: Gym) {
  const trainer = buildTrainer(gym.id);
  await userRepository.save(trainer);
  useSessionStore.setState({
    session: { userId: trainer.id, gymId: gym.id, role: 'trainer', startedAt: new Date().toISOString() },
  });

  render(
    <MemoryRouter initialEntries={['/gym/treinos']}>
      <Routes>
        <Route path="/gym/treinos" element={<WorkoutsScreen />} />
        <Route path="/gym/treinos/:planId" element={<p>Editor do plano</p>} />
        <Route path="/gym" element={<p>Home da academia</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('WorkoutsScreen', () => {
  it('mostra o estado vazio quando a academia não tem nenhum treino', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);

    expect(await screen.findByText('Nenhum treino criado')).toBeInTheDocument();
  });

  it('lista os planos da academia com situação e contagem de alunos', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const published = buildPlan(gym.id, { letter: 'A', name: 'Peito e Tríceps', published: true });
    const draft = buildPlan(gym.id, { letter: 'F', name: 'Rascunho', published: false });
    await workoutRepository.savePlan(published);
    await workoutRepository.savePlan(draft);
    await workoutRepository.assign(gym.id, published.id, ['aluno-1'], 'prof-1');

    await renderAsTrainerOf(gym);

    const publishedRow = (await screen.findByText('A · Peito e Tríceps')).closest('li') as HTMLElement;
    expect(within(publishedRow).getByText('Publicado')).toBeInTheDocument();
    expect(within(publishedRow).getByText(/1 aluno/)).toBeInTheDocument();

    const draftRow = screen.getByText('F · Rascunho').closest('li') as HTMLElement;
    expect(within(draftRow).getByText('Rascunho')).toBeInTheDocument();
  });

  it('nunca mostra treinos de outra academia', async () => {
    const gym = buildGym();
    const otherGym = buildGym({ name: 'Outra academia' });
    await gymRepository.save(gym);
    await gymRepository.save(otherGym);
    await workoutRepository.savePlan(buildPlan(otherGym.id, { name: 'Treino da outra' }));

    await renderAsTrainerOf(gym);

    await screen.findByText('Nenhum treino criado');
    expect(screen.queryByText(/Treino da outra/)).not.toBeInTheDocument();
  });

  it('duplicar cria uma cópia como rascunho, sem afetar o plano original', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const plan = buildPlan(gym.id, { letter: 'A', name: 'Peito e Tríceps', published: true });
    await workoutRepository.savePlan(plan);

    await renderAsTrainerOf(gym);
    await screen.findByText('A · Peito e Tríceps');

    fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));

    await waitFor(async () => {
      const plans = await workoutRepository.listPlans(gym.id);
      expect(plans).toHaveLength(2);
    });
    const plans = await workoutRepository.listPlans(gym.id);
    const copy = plans.find((p) => p.id !== plan.id);
    expect(copy?.name).toBe('Peito e Tríceps (cópia)');
    expect(copy?.published).toBe(false);
    expect(await screen.findByText('A · Peito e Tríceps (cópia)')).toBeInTheDocument();
  });
});
