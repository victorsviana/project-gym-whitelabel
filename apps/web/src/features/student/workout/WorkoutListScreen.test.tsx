import type { Gym, StudentProfile, User, WorkoutPlan } from '@gym/core';
import { createId, todayIsoDate } from '@gym/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  executionRepository,
  gymRepository,
  studentRepository,
  userRepository,
  workoutRepository,
} from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { WorkoutListScreen } from './WorkoutListScreen';

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
    name: 'Peito e Tríceps',
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

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/aluno/treino']}>
      <Routes>
        <Route path="/aluno/treino" element={<WorkoutListScreen />} />
        <Route path="/aluno/treino/:planId" element={<p>Execução do treino</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('WorkoutListScreen', () => {
  it('mostra o estado vazio quando o aluno não tem plano atribuído', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    await studentRepository.saveProfile(buildProfile(gym.id, student.id));

    useSessionStore.setState({
      session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
    });

    renderList();

    expect(await screen.findByText('Nenhum plano atribuído')).toBeInTheDocument();
  });

  it('lista os planos com progresso real e navega para a execução ao tocar', async () => {
    const gym = buildGym();
    const trainer = buildTrainer(gym.id);
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(trainer);
    await userRepository.save(student);
    await studentRepository.saveProfile(buildProfile(gym.id, student.id));

    const plan = buildPlan(gym.id, trainer.id);
    await workoutRepository.savePlan(plan);
    await workoutRepository.assign(gym.id, plan.id, [student.id], trainer.id);
    await executionRepository.markSetLog({
      id: createId(),
      gymId: gym.id,
      studentId: student.id,
      planId: plan.id,
      exerciseId: plan.exercises[0].id,
      setIndex: 0,
      date: todayIsoDate(),
      completedAt: new Date().toISOString(),
    });

    useSessionStore.setState({
      session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
    });

    renderList();

    expect(await screen.findByText('A · Peito e Tríceps')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText(/Montado por Douglas Prof · Academia Teste/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('A · Peito e Tríceps'));
    expect(await screen.findByText('Execução do treino')).toBeInTheDocument();
  });
});
