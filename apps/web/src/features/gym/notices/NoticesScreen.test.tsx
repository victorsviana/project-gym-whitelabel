import type { Gym, User, WorkoutPlan } from '@gym/core';
import { createId } from '@gym/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, noticeRepository, userRepository, workoutRepository } from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { NoticesScreen } from './NoticesScreen';

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

async function renderAsTrainerOf(gym: Gym) {
  const trainer = buildStudent(gym.id, { role: 'trainer', name: 'Professor', email: 'prof@x.com' });
  await userRepository.save(trainer);
  useSessionStore.setState({
    session: {
      userId: trainer.id,
      gymId: gym.id,
      role: 'trainer',
      startedAt: new Date().toISOString(),
    },
  });

  render(
    <MemoryRouter initialEntries={['/gym/avisos']}>
      <Routes>
        <Route path="/gym/avisos" element={<NoticesScreen />} />
        <Route path="/gym/alunos" element={<p>Alunos da academia</p>} />
        <Route path="/gym" element={<p>Home da academia</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NoticesScreen', () => {
  it('mostra o estado vazio quando não há nenhuma pendência', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);

    expect(await screen.findByText('Nenhuma pendência aberta')).toBeInTheDocument();
  });

  it('lista pendência derivada (new_student) e gravada (plan_change_request), sem duplicar aluno novo', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const bruno = buildStudent(gym.id, { name: 'Bruno Nunes', email: 'bruno@x.com' });
    const rafael = buildStudent(gym.id, { name: 'Rafael Dias', email: 'rafael@x.com' });
    await userRepository.save(bruno);
    await userRepository.save(rafael);
    const plan = buildPlan(gym.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [rafael.id], 'prof-1');
    await noticeRepository.save({
      id: createId(),
      gymId: gym.id,
      studentId: rafael.id,
      kind: 'plan_change_request',
      text: 'Pediu troca de treino (dor no joelho)',
      resolved: false,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    await renderAsTrainerOf(gym);

    expect(await screen.findByText('Bruno Nunes')).toBeInTheDocument();
    expect(screen.getByText('Rafael Dias')).toBeInTheDocument();
    expect(screen.getByText('Aluno novo')).toBeInTheDocument();
    expect(screen.getByText('Troca de treino')).toBeInTheDocument();
  });

  it('resolver a pendência de troca de treino a remove da fila', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const rafael = buildStudent(gym.id, { name: 'Rafael Dias', email: 'rafael@x.com' });
    await userRepository.save(rafael);
    const plan = buildPlan(gym.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [rafael.id], 'prof-1');
    await noticeRepository.save({
      id: createId(),
      gymId: gym.id,
      studentId: rafael.id,
      kind: 'plan_change_request',
      text: 'Pediu troca de treino (dor no joelho)',
      resolved: false,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    await renderAsTrainerOf(gym);
    fireEvent.click(await screen.findByRole('button', { name: 'Resolver' }));

    await waitFor(() => {
      expect(screen.getByText('Nenhuma pendência aberta')).toBeInTheDocument();
    });
    const notices = await noticeRepository.listByGym(gym.id);
    expect(notices[0].resolved).toBe(true);
  });

  it('o atalho navega para a ficha do aluno em /gym/alunos?student=<id>', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const bruno = buildStudent(gym.id, { name: 'Bruno Nunes', email: 'bruno@x.com' });
    await userRepository.save(bruno);

    await renderAsTrainerOf(gym);
    fireEvent.click(await screen.findByRole('button', { name: 'Atribuir treino' }));

    expect(await screen.findByText('Alunos da academia')).toBeInTheDocument();
  });
});
