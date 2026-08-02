import type { Gym, User } from '@gym/core';
import { createId, todayIsoDate } from '@gym/core';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, nutritionRepository, userRepository } from '../../../storage';
import { loadData, saveData } from '../../../storage/store';
import { useSessionStore } from '../../auth/use-session';
import { DietScreen } from './DietScreen';

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

function seedFoodBase(gymId: string | null = null) {
  const data = loadData();
  data.foods.push(
    { id: createId(), gymId, name: 'Ovo inteiro', kcal: 155, protein: 13, carbs: 1.1, fat: 11, defaultQuantity: 100 },
    { id: createId(), gymId, name: 'Banana', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultQuantity: 120 },
  );
  saveData(data);
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/aluno/dieta']}>
      <Routes>
        <Route path="/aluno/dieta" element={<DietScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

function login(gym: Gym, student: User) {
  useSessionStore.setState({
    session: { userId: student.id, gymId: gym.id, role: 'student', startedAt: new Date().toISOString() },
  });
}

describe('DietScreen', () => {
  it('estado vazio: nenhuma refeição hoje, mas sugestões rápidas de um toque funcionam', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    seedFoodBase();
    login(gym, student);

    renderScreen();

    expect(await screen.findByText('Nenhuma refeição registrada')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ovo inteiro · 100g' }));

    expect(await screen.findByText('Ovo inteiro')).toBeInTheDocument();
    const today = todayIsoDate();
    const meals = await nutritionRepository.listMeals(gym.id, student.id, today);
    expect(meals).toHaveLength(1);
    expect(meals[0]).toMatchObject({ name: 'Ovo inteiro', quantity: 100, source: 'search' });
  });

  it('agrupa refeições reais por tipo com total, e remove item', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    seedFoodBase();

    const today = todayIsoDate();
    await nutritionRepository.saveMeal({
      id: createId(),
      gymId: gym.id,
      studentId: student.id,
      date: today,
      type: 'breakfast',
      name: 'Aveia com leite',
      kcal: 300,
      protein: 15,
      carbs: 40,
      fat: 8,
      source: 'manual',
      createdAt: new Date().toISOString(),
    });
    await nutritionRepository.saveMeal({
      id: createId(),
      gymId: gym.id,
      studentId: student.id,
      date: today,
      type: 'breakfast',
      name: 'Café preto',
      kcal: 5,
      protein: 0,
      carbs: 0,
      fat: 0,
      source: 'manual',
      createdAt: new Date().toISOString(),
    });
    login(gym, student);

    renderScreen();

    expect(await screen.findByText('Aveia com leite')).toBeInTheDocument();
    expect(screen.getByText('Café preto')).toBeInTheDocument();
    expect(screen.getByText('305 kcal')).toBeInTheDocument(); // total do grupo café da manhã

    fireEvent.click(screen.getByRole('button', { name: 'Remover Café preto' }));

    await waitFor(() => expect(screen.queryByText('Café preto')).not.toBeInTheDocument());
    expect(await nutritionRepository.listMeals(gym.id, student.id, today)).toHaveLength(1);
  });

  it('registra por busca com quantidade ajustável recalculando macros em tempo real', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    seedFoodBase();
    login(gym, student);

    renderScreen();
    await screen.findByText('Sugestões rápidas');

    fireEvent.click(screen.getByRole('button', { name: '+ Registrar' }));
    const sheet = screen.getByRole('dialog');

    fireEvent.click(within(sheet).getByRole('button', { name: /^Banana/ }));
    expect(within(sheet).getByText(/^107 kcal/)).toBeInTheDocument(); // 89 kcal/100g * 120g (defaultQuantity), arredondado

    fireEvent.click(within(sheet).getByRole('button', { name: '50g' }));
    expect(within(sheet).getByText(/^45 kcal/)).toBeInTheDocument(); // 89*50/100 arredondado

    fireEvent.click(within(sheet).getByRole('button', { name: /Adicionar ao/ }));

    const today = todayIsoDate();
    const meals = await nutritionRepository.listMeals(gym.id, student.id, today);
    expect(meals).toHaveLength(1);
    expect(meals[0]).toMatchObject({ name: 'Banana', quantity: 50, kcal: 45, source: 'search' });
  });

  it('registra manualmente com nome e macros livres', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    seedFoodBase();
    login(gym, student);

    renderScreen();
    await screen.findByText('Sugestões rápidas');

    fireEvent.click(screen.getByRole('button', { name: '+ Registrar' }));
    const sheet = screen.getByRole('dialog');

    fireEvent.click(within(sheet).getByRole('radio', { name: 'Escrever' }));
    fireEvent.change(within(sheet).getByLabelText('Nome'), { target: { value: 'Marmita caseira' } });

    fireEvent.click(within(sheet).getByRole('button', { name: /Adicionar ao/ }));

    const today = todayIsoDate();
    const meals = await nutritionRepository.listMeals(gym.id, student.id, today);
    expect(meals).toHaveLength(1);
    expect(meals[0]).toMatchObject({ name: 'Marmita caseira', source: 'manual', kcal: 0 });
  });

  it('simula registro por áudio, rotulado como demonstração', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    seedFoodBase();
    login(gym, student);

    renderScreen();
    await screen.findByText('Sugestões rápidas');

    fireEvent.click(screen.getByRole('button', { name: '+ Registrar' }));
    const sheet = screen.getByRole('dialog');

    fireEvent.click(within(sheet).getByRole('radio', { name: 'Áudio' }));
    expect(within(sheet).getByText(/demonstração/)).toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole('button', { name: /Simular gravação/ }));
    expect(within(sheet).getByDisplayValue('2 ovos e 1 banana')).toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole('button', { name: /Adicionar ao/ }));

    const today = todayIsoDate();
    const meals = await nutritionRepository.listMeals(gym.id, student.id, today);
    expect(meals).toHaveLength(1);
    expect(meals[0]).toMatchObject({ name: '2 ovos e 1 banana', source: 'audio', kcal: 399 });
  });
});
