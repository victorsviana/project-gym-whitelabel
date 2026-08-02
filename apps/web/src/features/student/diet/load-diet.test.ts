import type { DailyGoal, Gym, Meal, User } from '@gym/core';
import { createId } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { gymRepository, studentRepository, userRepository } from '../../../storage';
import { loadData, saveData } from '../../../storage/store';
import { loadDietHistory, loadDietToday, loadFoodBase } from './load-diet';

beforeEach(() => {
  localStorage.clear();
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

function buildGoal(gymId: string, studentId: string, overrides: Partial<DailyGoal> = {}): DailyGoal {
  return {
    studentId,
    gymId,
    kcal: 2000,
    protein: 150,
    carbs: 200,
    fat: 60,
    water: 3000,
    source: 'computed',
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildMeal(gymId: string, studentId: string, date: string, overrides: Partial<Meal> = {}): Meal {
  return {
    id: createId(),
    gymId,
    studentId,
    date,
    type: 'lunch',
    name: 'Frango com arroz',
    kcal: 500,
    protein: 40,
    carbs: 50,
    fat: 10,
    source: 'manual',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('loadDietToday', () => {
  it('junta meta e refeições reais do dia', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    await studentRepository.saveGoal(buildGoal(gym.id, student.id));

    const data = loadData();
    data.meals.push(buildMeal(gym.id, student.id, '2026-03-02', { name: 'Café da manhã real' }));
    saveData(data);

    const result = await loadDietToday(gym.id, student.id, '2026-03-02');

    expect(result.goal?.kcal).toBe(2000);
    expect(result.meals).toHaveLength(1);
    expect(result.meals[0].name).toBe('Café da manhã real');
  });
});

describe('loadDietHistory', () => {
  it('cobre os últimos 7 dias, do mais antigo pro mais recente, atravessando virada de mês sem cuidado especial', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);

    const data = loadData();
    data.meals.push(
      buildMeal(gym.id, student.id, '2026-02-24', { kcal: 300, protein: 20, carbs: 30, fat: 5 }), // 6 dias antes de 03-02
      buildMeal(gym.id, student.id, '2026-02-24', { kcal: 200, protein: 10, carbs: 20, fat: 5 }),
      buildMeal(gym.id, student.id, '2026-03-02', { kcal: 500, protein: 40, carbs: 50, fat: 10 }), // hoje
      buildMeal(gym.id, student.id, '2026-02-17', { kcal: 999, protein: 99, carbs: 99, fat: 99 }), // fora da janela de 7 dias
    );
    saveData(data);

    const history = await loadDietHistory(gym.id, student.id, '2026-03-02');

    expect(history).toHaveLength(7);
    expect(history[0].date).toBe('2026-02-24');
    expect(history[6].date).toBe('2026-03-02');

    const feb24 = history.find((day) => day.date === '2026-02-24');
    expect(feb24?.mealCount).toBe(2);
    expect(feb24?.totals).toEqual({ kcal: 500, protein: 30, carbs: 50, fat: 10 });

    const mar02 = history.find((day) => day.date === '2026-03-02');
    expect(mar02?.mealCount).toBe(1);
    expect(mar02?.totals.kcal).toBe(500);

    const emptyDay = history.find((day) => day.date === '2026-02-25');
    expect(emptyDay?.mealCount).toBe(0);
    expect(emptyDay?.totals).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('loadFoodBase', () => {
  it('junta a base global com a da própria academia, sem vazar a de outra (base única — PROTOTYPE-AUDIT.md #7)', async () => {
    const gymA = buildGym({ name: 'Academia A' });
    const gymB = buildGym({ name: 'Academia B' });
    await gymRepository.save(gymA);
    await gymRepository.save(gymB);

    const data = loadData();
    data.foods.push(
      { id: createId(), gymId: null, name: 'Ovo inteiro', kcal: 155, protein: 13, carbs: 1.1, fat: 11, defaultQuantity: 100 },
      { id: createId(), gymId: gymA.id, name: 'Barra da Academia A', kcal: 200, protein: 10, carbs: 20, fat: 5, defaultQuantity: 30 },
      { id: createId(), gymId: gymB.id, name: 'Barra da Academia B', kcal: 200, protein: 10, carbs: 20, fat: 5, defaultQuantity: 30 },
    );
    saveData(data);

    const foodsA = await loadFoodBase(gymA.id);
    const names = foodsA.map((food) => food.name);
    expect(names).toContain('Ovo inteiro');
    expect(names).toContain('Barra da Academia A');
    expect(names).not.toContain('Barra da Academia B');
  });
});
