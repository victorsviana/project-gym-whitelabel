import type { Gym, User, WorkoutPlan } from '@gym/core';
import { createId } from '@gym/core';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, userRepository, workoutRepository } from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { PlanEditorScreen } from './PlanEditorScreen';

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
    name: 'Peito e Tríceps',
    focus: 'Peito',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [],
    published: false,
    createdBy: 'prof-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

async function renderPlanEditor(gym: Gym, planId: string) {
  const trainer = buildTrainer(gym.id);
  await userRepository.save(trainer);
  useSessionStore.setState({
    session: { userId: trainer.id, gymId: gym.id, role: 'trainer', startedAt: new Date().toISOString() },
  });

  render(
    <MemoryRouter initialEntries={[`/gym/treinos/${planId}`]}>
      <Routes>
        <Route path="/gym/treinos/:planId" element={<PlanEditorScreen />} />
        <Route path="/gym/treinos" element={<p>Lista de treinos</p>} />
      </Routes>
    </MemoryRouter>,
  );

  return trainer;
}

describe('PlanEditorScreen — criação', () => {
  it('cria o plano com os dados básicos e passa a mostrar publicação e atribuição', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderPlanEditor(gym, 'novo');

    fireEvent.change(await screen.findByLabelText('Letra'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Peito e Tríceps' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar plano' }));

    await waitFor(async () => {
      const plans = await workoutRepository.listPlans(gym.id);
      expect(plans).toHaveLength(1);
    });
    expect(await screen.findByText('Publicação')).toBeInTheDocument();
    expect(screen.getByText('Alunos')).toBeInTheDocument();
  });

  it('recusa criar sem letra ou nome', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderPlanEditor(gym, 'novo');
    fireEvent.click(await screen.findByRole('button', { name: 'Criar plano' }));

    expect(await screen.findByText('Informe letra e nome do plano.')).toBeInTheDocument();
    expect(await workoutRepository.listPlans(gym.id)).toHaveLength(0);
  });
});

describe('PlanEditorScreen — edição', () => {
  it('adiciona um exercício e persiste ao salvar', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const plan = buildPlan(gym.id);
    await workoutRepository.savePlan(plan);

    await renderPlanEditor(gym, plan.id);
    await screen.findByText('Publicação');

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    fireEvent.change(screen.getByLabelText('Nome do exercício'), {
      target: { value: 'Supino reto com halteres' },
    });
    fireEvent.change(screen.getByLabelText('Repetições'), { target: { value: '8–10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByText('Supino reto com halteres')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(async () => {
      const saved = await workoutRepository.findPlanById(gym.id, plan.id);
      expect(saved?.exercises).toHaveLength(1);
    });
  });

  it('publicar exige confirmação e deixa o plano visível para o aluno atribuído', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const plan = buildPlan(gym.id, { published: false });
    await workoutRepository.savePlan(plan);
    const student = buildStudent(gym.id);
    await userRepository.save(student);
    await workoutRepository.assign(gym.id, plan.id, [student.id], 'prof-1');

    await renderPlanEditor(gym, plan.id);
    await screen.findByText('Publicação');

    fireEvent.click(screen.getByRole('switch', { name: 'Publicar treino' }));
    expect(
      screen.getByText('Publicar agora deixa o treino visível para os alunos atribuídos na hora. Confirmar?'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar publicação' }));

    await waitFor(async () => {
      const visible = await workoutRepository.listPlansForStudent(gym.id, student.id);
      expect(visible).toHaveLength(1);
    });
  });

  it('atribuir alunos no editor reflete na lista do aluno', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const plan = buildPlan(gym.id, { published: true });
    await workoutRepository.savePlan(plan);
    const student = buildStudent(gym.id, { name: 'Bruno Nunes' });
    await userRepository.save(student);

    await renderPlanEditor(gym, plan.id);
    await screen.findByText('Publicação');

    fireEvent.click(screen.getByRole('button', { name: 'Atribuir' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('switch', { name: 'Atribuir a Bruno Nunes' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar atribuição' }));

    await waitFor(async () => {
      const assignments = await workoutRepository.listAssignmentsForStudent(gym.id, student.id);
      expect(assignments.filter((a) => a.active)).toHaveLength(1);
    });
  });
});
