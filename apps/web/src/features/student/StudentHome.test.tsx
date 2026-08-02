import type { DailyGoal, Gym, Meal, StudentProfile, User, WorkoutPlan } from '@gym/core';
import { addDays, createId, todayIsoDate } from '@gym/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  activityRepository,
  gymRepository,
  nutritionRepository,
  studentRepository,
  userRepository,
  workoutRepository,
} from '../../storage';
import { useSessionStore } from '../auth/use-session';
import { StudentHome } from './StudentHome';

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

function buildGoal(gymId: string, studentId: string, overrides: Partial<DailyGoal> = {}): DailyGoal {
  return {
    studentId,
    gymId,
    kcal: 2600,
    protein: 180,
    carbs: 300,
    fat: 70,
    water: 3000,
    source: 'computed',
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildPlan(gymId: string, createdBy: string, overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return {
    id: createId(),
    gymId,
    letter: 'A',
    name: 'Peito e Tríceps',
    focus: 'Peito',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [
      {
        id: createId(),
        name: 'Supino reto',
        sets: 4,
        reps: '8-10',
        order: 0,
        sensitiveRegions: ['shoulder'],
      },
      {
        id: createId(),
        name: 'Tríceps corda',
        sets: 3,
        reps: '12',
        order: 1,
        sensitiveRegions: [],
      },
    ],
    published: true,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/aluno']}>
      <Routes>
        <Route path="/aluno" element={<StudentHome />} />
        <Route path="/aluno/treino/:planId" element={<p>Execução do treino</p>} />
        <Route path="/aluno/ajustes" element={<p>Tela de ajustes</p>} />
        <Route path="/" element={<div>Seletor de perfil</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StudentHome', () => {
  it('mostra o treino do dia, as metas reais e o extrato ao tocar num dia ativo', async () => {
    const gym = buildGym();
    const trainer = buildTrainer(gym.id);
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(trainer);
    await userRepository.save(student);
    await studentRepository.saveProfile(buildProfile(gym.id, student.id, { injuries: ['shoulder'] }));
    await studentRepository.saveGoal(buildGoal(gym.id, student.id));

    const plan = buildPlan(gym.id, trainer.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [student.id], trainer.id);

    const today = todayIsoDate();
    const yesterday = addDays(today, -1);
    const meal: Meal = {
      id: createId(),
      gymId: gym.id,
      studentId: student.id,
      date: today,
      type: 'lunch',
      name: 'Frango com arroz',
      kcal: 500,
      protein: 40,
      carbs: 50,
      fat: 10,
      source: 'manual',
      createdAt: new Date().toISOString(),
    };
    await nutritionRepository.saveMeal(meal);
    await activityRepository.save({ gymId: gym.id, studentId: student.id, date: today, hasWorkout: false, hasMeal: true });
    await activityRepository.save({ gymId: gym.id, studentId: student.id, date: yesterday, hasWorkout: true, hasMeal: false });

    useSessionStore.setState({
      session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
    });

    renderHome();

    // Card do treino de hoje — único plano atribuído, então é sempre "o de hoje".
    expect(await screen.findByText('Peito e Tríceps')).toBeInTheDocument();
    expect(screen.getByText('Peito · 55 min')).toBeInTheDocument();
    expect(screen.getByText('Professor: Douglas Prof')).toBeInTheDocument();
    expect(screen.getByText('Adaptado')).toBeInTheDocument();

    // Metas de hoje — consumo real da refeição seedada contra a meta.
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('de 2600 kcal')).toBeInTheDocument();
    expect(screen.getByText('2100 kcal restantes')).toBeInTheDocument();

    // Sequência — hoje (refeição) + ontem (treino) = 2 dias.
    expect(screen.getByText('🔥 2 dias')).toBeInTheDocument();

    // Ver plano — sheet somente leitura com o selo Adaptado no exercício certo.
    fireEvent.click(screen.getByRole('button', { name: 'Ver plano' }));
    const planSheet = screen.getByRole('dialog');
    expect(within(planSheet).getByText('Supino reto')).toBeInTheDocument();
    expect(within(planSheet).getByText('Tríceps corda')).toBeInTheDocument();
    fireEvent.click(within(planSheet).getByRole('button', { name: 'Fechar' }));

    // Tocar no dia de hoje no calendário abre o extrato com a refeição real.
    fireEvent.click(screen.getByRole('button', { name: /hoje/ }));
    const daySheet = await screen.findByRole('dialog');
    expect(within(daySheet).getByText('Total do dia')).toBeInTheDocument();
    expect(within(daySheet).getByText('Frango com arroz')).toBeInTheDocument();
    expect(within(daySheet).getByText('Nenhum treino registrado.')).toBeInTheDocument();
    fireEvent.click(within(daySheet).getByRole('button', { name: 'Fechar' }));

    // Iniciar treino navega para a execução do plano do dia (F1-E10).
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar treino' }));
    expect(await screen.findByText('Execução do treino')).toBeInTheDocument();
  });

  it('sem plano atribuído mostra estado vazio; hidratação soma e persiste em copos de 250ml', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    await studentRepository.saveProfile(buildProfile(gym.id, student.id));
    await studentRepository.saveGoal(buildGoal(gym.id, student.id));

    useSessionStore.setState({
      session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
    });

    renderHome();

    expect(await screen.findByText('Sem treino hoje')).toBeInTheDocument();
    expect(screen.getByText('Seu professor ainda não montou seu treino.')).toBeInTheDocument();

    expect(await screen.findByText('0,0L / 3,0L')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '+ copo' }));
    expect(await screen.findByText('0,3L / 3,0L')).toBeInTheDocument();

    const today = todayIsoDate();
    expect(await nutritionRepository.findWaterLog(gym.id, student.id, today)).toMatchObject({ amount: 250 });

    fireEvent.click(screen.getByRole('button', { name: '− copo' }));
    expect(await screen.findByText('0,0L / 3,0L')).toBeInTheDocument();
  });

  it('"Ajustes" navega para a tela de ajustes; "Ajustar" abre o sheet de metas e reflete na hora (F1-E12)', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    await studentRepository.saveProfile(buildProfile(gym.id, student.id));
    await studentRepository.saveGoal(buildGoal(gym.id, student.id, { kcal: 2600 }));

    useSessionStore.setState({
      session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
    });

    renderHome();

    await screen.findByText('Sem treino hoje');

    fireEvent.click(screen.getByRole('button', { name: 'Ajustar' }));
    const sheet = await screen.findByRole('dialog');
    fireEvent.click(within(sheet).getAllByRole('button', { name: 'Aumentar' })[0]);

    // "de 2650 kcal" reflete na hora no anel de calorias, sem reload.
    expect(await screen.findByText('de 2650 kcal')).toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Fechar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }));
    expect(await screen.findByText('Tela de ajustes')).toBeInTheDocument();
  });
});
