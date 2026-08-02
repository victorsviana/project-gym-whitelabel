import type { DailyGoal, Gym, StudentProfile, User } from '@gym/core';
import { createId, todayIsoDate } from '@gym/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { activityRepository, executionRepository, gymRepository, studentRepository, userRepository } from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { ProfileScreen } from './ProfileScreen';

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

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/aluno/perfil']}>
      <Routes>
        <Route path="/aluno/perfil" element={<ProfileScreen />} />
        <Route path="/aluno/ajustes" element={<p>Tela de ajustes</p>} />
        <Route path="/" element={<div>Seletor de perfil</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function seedStudentWithActivity() {
  const gym = buildGym();
  const student = buildStudent(gym.id);
  await gymRepository.save(gym);
  await userRepository.save(student);
  await studentRepository.saveProfile(buildProfile(gym.id, student.id));
  await studentRepository.saveGoal(buildGoal(gym.id, student.id));

  const today = todayIsoDate();
  await activityRepository.save({ gymId: gym.id, studentId: student.id, date: today, hasWorkout: true, hasMeal: false });
  await executionRepository.markSetLog({
    id: createId(),
    gymId: gym.id,
    studentId: student.id,
    planId: 'p1',
    exerciseId: 'e1',
    setIndex: 0,
    date: today,
    completedAt: new Date().toISOString(),
  });
  await executionRepository.markSetLog({
    id: createId(),
    gymId: gym.id,
    studentId: student.id,
    planId: 'p1',
    exerciseId: 'e1',
    setIndex: 1,
    date: today,
    completedAt: new Date().toISOString(),
  });

  useSessionStore.setState({
    session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
  });

  return { gym, student };
}

describe('ProfileScreen', () => {
  it('mostra iniciais, nome, academia e as três estatísticas reais', async () => {
    await seedStudentWithActivity();
    renderProfile();

    expect(await screen.findByText('Aluno')).toBeInTheDocument();
    expect(screen.getByText('Aluno · Academia Teste')).toBeInTheDocument();
    expect(screen.getByText('AT')).toBeInTheDocument();

    // sequência e dias/mês são ambos 1 (só hoje ativo); séries marcadas são 2.
    expect(await screen.findAllByText('1')).toHaveLength(2);
    expect(screen.getByText('2')).toBeInTheDocument(); // séries marcadas
  });

  it('navega para Ajustes', async () => {
    await seedStudentWithActivity();
    renderProfile();

    fireEvent.click(await screen.findByRole('button', { name: 'Ajustes' }));
    expect(await screen.findByText('Tela de ajustes')).toBeInTheDocument();
  });

  it('abrir "Ajustar metas de dieta" e mexer numa meta reflete e persiste na hora', async () => {
    const { gym, student } = await seedStudentWithActivity();
    renderProfile();

    fireEvent.click(await screen.findByRole('button', { name: 'Ajustar metas de dieta' }));
    const sheet = await screen.findByRole('dialog');
    expect(sheet).toHaveTextContent('Ajustar metas');

    fireEvent.click(screen.getAllByRole('button', { name: 'Aumentar' })[0]);
    expect(await screen.findByText('2.650 kcal')).toBeInTheDocument();

    const saved = await studentRepository.findGoal(gym.id, student.id);
    expect(saved?.kcal).toBe(2650);
    expect(saved?.source).toBe('manual');
  });

  it('sair da conta limpa a sessão e volta ao seletor', async () => {
    await seedStudentWithActivity();
    renderProfile();

    fireEvent.click(await screen.findByRole('button', { name: 'Sair da conta' }));
    expect(await screen.findByText('Seletor de perfil')).toBeInTheDocument();
    expect(useSessionStore.getState().session).toBeNull();
  });
});
