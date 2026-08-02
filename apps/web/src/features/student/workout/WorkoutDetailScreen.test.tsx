import type { Gym, StudentProfile, User, WorkoutPlan } from '@gym/core';
import { createId, todayIsoDate } from '@gym/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  activityRepository,
  executionRepository,
  gymRepository,
  studentRepository,
  userRepository,
  workoutRepository,
} from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { WorkoutDetailScreen } from './WorkoutDetailScreen';

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

function buildTrainer(gymId: string, overrides: Partial<User> = {}): User {
  return {
    id: createId(),
    gymId,
    role: 'trainer',
    name: 'Douglas Prof',
    email: 'prof@teste.com',
    password: 'demo1234',
    active: true,
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

function buildProfile(gymId: string, studentId: string, overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    studentId,
    gymId,
    sex: 'male',
    age: 28,
    weight: 80,
    height: 178,
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 5,
    injuries: [],
    restrictions: [],
    onboardedAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildPlan(gymId: string, createdBy: string, overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: createId(),
    gymId,
    letter: 'A',
    name: 'Peito',
    focus: 'Peito',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [{ id: createId(), name: 'Supino reto', sets: 3, reps: '8-10', order: 0, sensitiveRegions: [] }],
    published: true,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

async function setUp(planOverrides: Partial<WorkoutPlan> = {}) {
  const gym = buildGym();
  const trainer = buildTrainer(gym.id);
  const student = buildStudent(gym.id);
  await gymRepository.save(gym);
  await userRepository.save(trainer);
  await userRepository.save(student);
  await studentRepository.saveProfile(buildProfile(gym.id, student.id));

  const plan = buildPlan(gym.id, trainer.id, planOverrides);
  await workoutRepository.savePlan(plan);
  await workoutRepository.assign(gym.id, plan.id, [student.id], trainer.id);

  useSessionStore.setState({
    session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
  });

  return { gym, trainer, student, plan };
}

function renderDetail(planId: string) {
  return render(
    <MemoryRouter initialEntries={[`/aluno/treino/${planId}`]}>
      <Routes>
        <Route path="/aluno/treino/:planId" element={<WorkoutDetailScreen />} />
        <Route path="/aluno/treino" element={<p>Lista de treinos</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('WorkoutDetailScreen', () => {
  it('marcar uma série persiste e ativa a constância do dia; desmarcar reverte os dois', async () => {
    const { gym, student, plan } = await setUp();
    renderDetail(plan.id);

    const today = todayIsoDate();
    const setButton = await screen.findByRole('button', {
      name: 'Série 1 de Supino reto, não concluída',
    });

    fireEvent.click(setButton);
    expect(await screen.findByRole('button', { name: 'Série 1 de Supino reto, concluída' })).toBeInTheDocument();

    let logs = await executionRepository.listSetLogs(gym.id, student.id, plan.id, today);
    expect(logs).toHaveLength(1);
    const [year, month] = today.split('-').map(Number);
    let days = await activityRepository.listByMonth(gym.id, student.id, year, month);
    expect(days.find((day) => day.date === today)).toMatchObject({ hasWorkout: true });

    fireEvent.click(screen.getByRole('button', { name: 'Série 1 de Supino reto, concluída' }));
    expect(
      await screen.findByRole('button', { name: 'Série 1 de Supino reto, não concluída' }),
    ).toBeInTheDocument();

    logs = await executionRepository.listSetLogs(gym.id, student.id, plan.id, today);
    expect(logs).toHaveLength(0);
    days = await activityRepository.listByMonth(gym.id, student.id, year, month);
    expect(days.find((day) => day.date === today)).toMatchObject({ hasWorkout: false });
  });

  it('registrar carga persiste no histórico e some com o aviso de "sem histórico"', async () => {
    const { gym, student, plan } = await setUp();
    renderDetail(plan.id);

    await screen.findByText('Supino reto');
    expect(screen.getByText('Sem histórico de carga ainda.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar' })); // 20 -> 22,5 kg
    fireEvent.click(screen.getByRole('button', { name: 'Registrar carga' }));

    expect(await screen.findByText('Carga registrada.')).toBeInTheDocument();
    expect(screen.queryByText('Sem histórico de carga ainda.')).not.toBeInTheDocument();
    expect(screen.getByText('0 kg')).toBeInTheDocument(); // delta neutro no primeiro registro

    const today = todayIsoDate();
    const history = await executionRepository.listLoadLogs(gym.id, student.id, plan.id, plan.exercises[0].id);
    expect(history).toEqual([expect.objectContaining({ date: today, weight: 22.5 })]);
  });

  it('mostra estado vazio para um plano que não está mais atribuído ao aluno', async () => {
    await setUp();
    renderDetail('plano-inexistente');

    expect(await screen.findByText('Treino não encontrado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para treino' }));
    expect(await screen.findByText('Lista de treinos')).toBeInTheDocument();
  });

  it('cronômetro de sessão inicia em 00:00 e alterna entre Iniciar e Pausar', async () => {
    const { plan } = await setUp();
    renderDetail(plan.id);

    await screen.findByText('Supino reto');
    expect(screen.getByText('00:00')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Iniciar' });
    fireEvent.click(toggle);
    expect(await screen.findByRole('button', { name: 'Pausar' })).toBeInTheDocument();
  });
});
