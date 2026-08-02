import type { Gym, User, WorkoutPlan } from '@gym/core';
import { createId } from '@gym/core';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  gymRepository,
  noticeRepository,
  studentRepository,
  userRepository,
  workoutRepository,
} from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { StudentsScreen } from './StudentsScreen';

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

async function renderAsTrainerOf(gym: Gym, initialEntry = '/gym/alunos') {
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
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/gym/alunos" element={<StudentsScreen />} />
        <Route path="/gym" element={<p>Home da academia</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StudentsScreen', () => {
  it('mostra o estado vazio quando a academia não tem nenhum aluno', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);

    expect(await screen.findByText('Nenhum aluno cadastrado')).toBeInTheDocument();
  });

  it('deriva a situação real de cada aluno a partir de atribuição e pendência, sem mock', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const plan = buildPlan(gym.id);
    await workoutRepository.savePlan(plan);

    const semTreino = buildStudent(gym.id, { name: 'Bruno Nunes', email: 'bruno@x.com' });
    const ativo = buildStudent(gym.id, { name: 'Victor Silva', email: 'victor@x.com' });
    const aRevisar = buildStudent(gym.id, { name: 'Rafael Dias', email: 'rafael@x.com' });
    await Promise.all([userRepository.save(semTreino), userRepository.save(ativo), userRepository.save(aRevisar)]);

    await workoutRepository.assign(gym.id, plan.id, [ativo.id, aRevisar.id], 'prof-1');
    await noticeRepository.save({
      id: createId(),
      gymId: gym.id,
      studentId: aRevisar.id,
      kind: 'plan_change_request',
      text: 'Pediu troca de treino',
      resolved: false,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    await renderAsTrainerOf(gym);

    const brunoRow = (await screen.findByText('Bruno Nunes')).closest('li') as HTMLElement;
    expect(within(brunoRow).getByText('Sem treino')).toBeInTheDocument();

    const victorRow = screen.getByText('Victor Silva').closest('li') as HTMLElement;
    expect(within(victorRow).getByText('Ativo')).toBeInTheDocument();

    const rafaelRow = screen.getByText('Rafael Dias').closest('li') as HTMLElement;
    expect(within(rafaelRow).getByText('A revisar')).toBeInTheDocument();
  });

  it('busca por nome e filtro por situação restringem a lista', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    await userRepository.save(buildStudent(gym.id, { name: 'Bruno Nunes', email: 'bruno@x.com' }));
    await userRepository.save(buildStudent(gym.id, { name: 'Ana Prado', email: 'ana@x.com' }));

    await renderAsTrainerOf(gym);
    await screen.findByText('Bruno Nunes');

    fireEvent.change(screen.getByLabelText('Buscar por nome'), { target: { value: 'bruno' } });
    expect(screen.getByText('Bruno Nunes')).toBeInTheDocument();
    expect(screen.queryByText('Ana Prado')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar por nome'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Ativo' }));
    expect(screen.getByText('Nenhum aluno encontrado')).toBeInTheDocument();
  });

  it('cadastrar aluno cria a conta e ele aparece na lista como "Sem treino"', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);
    await screen.findByText('Nenhum aluno cadastrado');

    fireEvent.click(screen.getAllByRole('button', { name: 'Cadastrar aluno' })[0]);
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Nome'), { target: { value: 'Novo Aluno' } });
    fireEvent.change(within(dialog).getByLabelText('E-mail'), { target: { value: 'novo@aluno.com' } });
    fireEvent.change(within(dialog).getByLabelText('Senha inicial'), {
      target: { value: 'demo1234' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cadastrar aluno' }));

    expect(await screen.findByText('Novo Aluno')).toBeInTheDocument();
    const students = await userRepository.listByGym(gym.id, 'student');
    expect(students).toHaveLength(1);
    expect(students[0].email).toBe('novo@aluno.com');
  });

  it('preencher a avaliação na ficha do aluno salva o perfil e as metas computadas', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Letícia Prado', email: 'leticia@x.com' });
    await userRepository.save(student);

    await renderAsTrainerOf(gym);
    fireEvent.click(await screen.findByText('Letícia Prado'));

    fireEvent.click(await screen.findByRole('button', { name: 'Preencher avaliação' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Feminino' }));
    fireEvent.change(screen.getByLabelText('Idade'), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '59' } });
    fireEvent.change(screen.getByLabelText('Altura (cm)'), { target: { value: '162' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Massa' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Iniciante' }));
    fireEvent.change(screen.getByLabelText('Dias de treino por semana'), { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    await waitFor(async () => {
      const profile = await studentRepository.findProfile(gym.id, student.id);
      expect(profile?.weight).toBe(59);
    });

    // Caso D de DOMAIN-RULES.md §1.8 — mesmos números de Letícia Prado no seed.
    const goal = await studentRepository.findGoal(gym.id, student.id);
    expect(goal).toMatchObject({ kcal: 2000, protein: 118, carbs: 276, fat: 47, water: 2250 });
  });

  it('atribuir treino a partir da ficha do aluno atualiza a situação dele na lista', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const plan = buildPlan(gym.id, { published: true });
    await workoutRepository.savePlan(plan);
    const student = buildStudent(gym.id, { name: 'Bruno Nunes', email: 'bruno@x.com' });
    await userRepository.save(student);

    await renderAsTrainerOf(gym);
    fireEvent.click(await screen.findByText('Bruno Nunes'));

    fireEvent.click(await screen.findByRole('button', { name: 'Atribuir treino' }));
    const dialog = await screen.findByRole('dialog', { name: 'Atribuir treino' });
    fireEvent.click(within(dialog).getByRole('switch', { name: `Atribuir ${plan.name}` }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar atribuição' }));

    await waitFor(async () => {
      const assignments = await workoutRepository.listAssignmentsForStudent(gym.id, student.id);
      expect(assignments.filter((a) => a.active)).toHaveLength(1);
    });

    await waitFor(() => {
      const brunoRow = screen
        .getAllByText('Bruno Nunes')
        .map((el) => el.closest('li'))
        .find((el): el is HTMLLIElement => el !== null);
      expect(brunoRow).not.toBeUndefined();
      expect(within(brunoRow!).getByText('Ativo')).toBeInTheDocument();
    });
  });

  it('abre a ficha do aluno direto quando chega com ?student=<id> — atalho da tela de Avisos', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);
    const student = buildStudent(gym.id, { name: 'Diego Ramos', email: 'diego@x.com' });
    await userRepository.save(student);

    await renderAsTrainerOf(gym, `/gym/alunos?student=${student.id}`);

    expect(await screen.findByRole('dialog', { name: 'Diego Ramos' })).toBeInTheDocument();
  });
});
