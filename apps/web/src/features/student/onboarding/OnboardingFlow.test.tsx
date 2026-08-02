import type { Gym, User } from '@gym/core';
import { computeDailyGoal, createId } from '@gym/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, studentRepository, userRepository } from '../../../storage';
import { useSessionStore } from '../../auth/use-session';
import { StudentHome } from '../StudentHome.tsx';
import { OnboardingFlow } from './OnboardingFlow.tsx';
import type { OnboardingAnswers } from './types';

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
    name: 'Aluna Teste',
    email: 'aluna@teste.com',
    password: 'demo1234',
    active: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

async function renderOnboardingAsStudent(gym: Gym, student: User) {
  await gymRepository.save(gym);
  await userRepository.save(student);
  useSessionStore.setState({
    session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
  });

  render(
    <MemoryRouter initialEntries={['/aluno/onboarding']}>
      <Routes>
        <Route path="/aluno/onboarding" element={<OnboardingFlow />} />
        <Route path="/aluno" element={<StudentHome />} />
        <Route path="/" element={<div>Seletor de perfil</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OnboardingFlow', () => {
  it('percorre os 7 passos, calcula as metas e salva o perfil do aluno', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await renderOnboardingAsStudent(gym, student);

    // Passo 0 — boas-vindas.
    expect(await screen.findByText(`Bem-vindo à`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('0/6')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }));

    // Passo 1 — sexo e idade (steppers respeitam os limites, aqui só longe deles).
    fireEvent.click(await screen.findByRole('button', { name: 'Feminino' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    // Passo 2 — peso e altura (dois steppers na mesma tela).
    const step2Steppers = await screen.findAllByRole('button', { name: 'Aumentar' });
    fireEvent.click(step2Steppers[0]); // peso
    fireEvent.click(step2Steppers[1]); // altura
    fireEvent.click(step2Steppers[1]); // altura de novo
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    // Passo 3 — objetivo, com subtítulo explicativo.
    expect(await screen.findByText('Déficit calórico + preservar músculo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Secar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    // Passo 4 — nível e dias por semana.
    fireEvent.click(await screen.findByRole('button', { name: 'Avançado' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    // Passo 5 — lesões.
    fireEvent.click(await screen.findByRole('button', { name: 'Ombro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    // Passo 6 — restrições: selecionar uma e depois "Nenhuma" precisa limpar a seleção.
    fireEvent.click(await screen.findByRole('button', { name: 'Vegetariano' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nenhuma' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver minhas metas' }));

    // Processamento — tela de teatro com percentual e mensagens.
    expect(await screen.findByText('Montando seu perfil')).toBeInTheDocument();

    const expectedAnswers: OnboardingAnswers = {
      sex: 'female',
      age: 32,
      weight: 71,
      height: 172,
      goal: 'cut',
      level: 'advanced',
      daysPerWeek: 4,
      injuries: ['shoulder'],
      restrictions: [],
    };
    const expectedGoal = computeDailyGoal(expectedAnswers);

    // Metas prontas — números batem com DOMAIN-RULES.md via computeDailyGoal.
    expect(
      await screen.findByText(`${expectedGoal.kcal.toLocaleString('pt-BR')} kcal`, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(`${expectedGoal.protein}g`)).toBeInTheDocument();
    expect(screen.getByText('Treino adaptado pro seu ombro', { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar no app' }));

    // Volta para a Home do aluno (agora com perfil — sem cair de novo no onboarding).
    expect(await screen.findByText('Área do aluno')).toBeInTheDocument();

    const savedProfile = await studentRepository.findProfile(gym.id, student.id);
    expect(savedProfile).toMatchObject(expectedAnswers);
    expect(savedProfile?.onboardedAt).not.toBeNull();

    const savedGoal = await studentRepository.findGoal(gym.id, student.id);
    expect(savedGoal).toMatchObject({
      kcal: expectedGoal.kcal,
      protein: expectedGoal.protein,
      carbs: expectedGoal.carbs,
      fat: expectedGoal.fat,
      water: expectedGoal.water,
    });
  }, 10000);

  it('voltar no primeiro passo sai da sessão em vez de travar', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await renderOnboardingAsStudent(gym, student);

    expect(await screen.findByText('Bem-vindo à', { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(await screen.findByText('Seletor de perfil')).toBeInTheDocument();
    expect(useSessionStore.getState().session).toBeNull();
  });
});
