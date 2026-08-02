import type { Gym, StudentProfile, User } from '@gym/core';
import { createId, todayIsoDate } from '@gym/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, studentRepository, userRepository } from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { SettingsScreen } from './SettingsScreen';

beforeEach(() => {
  localStorage.clear();
  useSessionStore.setState({ session: null });
  document.documentElement.removeAttribute('data-theme');
});

function buildGym(overrides: Partial<Gym> = {}): Gym {
  return {
    id: createId(),
    name: 'Bluefit',
    slug: 'bluefit',
    initials: 'BF',
    logo: null,
    theme: { brand: '#2E7BFF', brandFg: '#FFFFFF', mode: 'light' },
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
    sex: 'female',
    age: 24,
    weight: 59,
    height: 162,
    goal: 'cut',
    level: 'beginner',
    daysPerWeek: 4,
    injuries: [],
    restrictions: [],
    onboardedAt: new Date().toISOString(),
    lastAssessedAt: todayIsoDate(),
    ...overrides,
  };
}

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/aluno/ajustes']}>
      <Routes>
        <Route path="/aluno/ajustes" element={<SettingsScreen />} />
        <Route path="/aluno/perfil" element={<p>Tela de perfil</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function seedStudent() {
  const gym = buildGym();
  const student = buildStudent(gym.id);
  await gymRepository.save(gym);
  await userRepository.save(student);
  await studentRepository.saveProfile(buildProfile(gym.id, student.id));

  useSessionStore.setState({
    session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
  });

  return { gym, student };
}

describe('SettingsScreen', () => {
  it('mostra os dados da avaliação real', async () => {
    await seedStudent();
    renderSettings();

    expect(await screen.findByText('Secar')).toBeInTheDocument();
    expect(screen.getByText('59 kg')).toBeInTheDocument();
    expect(screen.getByText('162 cm')).toBeInTheDocument();
    expect(screen.getByText('4x / semana')).toBeInTheDocument();
  });

  it('trocar o tema repinta na hora e persiste — reload não perde a escolha', async () => {
    const { gym, student } = await seedStudent();
    renderSettings();

    await screen.findByText('Secar');
    expect(document.documentElement.dataset.theme).toBe('light'); // padrão da Bluefit

    fireEvent.click(screen.getByRole('radio', { name: 'Escuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');

    const saved = await studentRepository.findPreferences(gym.id, student.id);
    expect(saved?.themeMode).toBe('dark');
  });

  it('notificações começam com o padrão (treino e refeição ligados, reavaliação desligada) e persistem ao alternar', async () => {
    const { gym, student } = await seedStudent();
    renderSettings();

    const workoutToggle = await screen.findByRole('switch', { name: 'Lembrete de treino' });
    const reassessmentToggle = screen.getByRole('switch', { name: 'Reavaliação mensal' });
    expect(workoutToggle).toHaveAttribute('aria-checked', 'true');
    expect(reassessmentToggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(reassessmentToggle);
    expect(reassessmentToggle).toHaveAttribute('aria-checked', 'true');

    const saved = await studentRepository.findPreferences(gym.id, student.id);
    expect(saved?.notifications).toEqual({ workoutReminder: true, mealReminder: true, reassessmentReminder: true });
  });

  it('voltar navega para o Perfil', async () => {
    await seedStudent();
    renderSettings();

    fireEvent.click(await screen.findByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Tela de perfil')).toBeInTheDocument();
  });
});
