import type { Food, Gym, User } from '@gym/core';
import { createId } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { activityRepository, gymRepository, nutritionRepository, userRepository } from '../../../storage';
import { buildManualMeal, buildSearchMeal, removeMealEntry, saveMealEntry } from './save-meal';

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

const OVO: Food = { id: createId(), gymId: null, name: 'Ovo inteiro', kcal: 155, protein: 13, carbs: 1.1, fat: 11, defaultQuantity: 100 };

describe('buildSearchMeal', () => {
  it('calcula macros proporcionalmente à quantidade em gramas', () => {
    const meal = buildSearchMeal('gym-1', 'student-1', '2026-03-02', 'breakfast', OVO, 150);

    expect(meal.name).toBe('Ovo inteiro');
    expect(meal.quantity).toBe(150);
    expect(meal.source).toBe('search');
    expect(meal.kcal).toBe(Math.round((155 * 150) / 100));
    expect(meal.protein).toBe(Math.round((13 * 150) / 100));
  });
});

describe('buildManualMeal', () => {
  it('grava exatamente os macros informados, sem recalcular', () => {
    const meal = buildManualMeal(
      'gym-1',
      'student-1',
      '2026-03-02',
      'snack',
      'Vitamina caseira',
      { kcal: 320, protein: 20, carbs: 40, fat: 8 },
      'manual',
    );

    expect(meal.name).toBe('Vitamina caseira');
    expect(meal.quantity).toBeUndefined();
    expect(meal.source).toBe('manual');
    expect(meal.kcal).toBe(320);
  });
});

describe('saveMealEntry / removeMealEntry', () => {
  it('grava a refeição e liga ActivityDay.hasMeal sem mexer em hasWorkout', async () => {
    const gym = buildGym();
    const student = buildStudent(gym.id);
    await gymRepository.save(gym);
    await userRepository.save(student);
    await activityRepository.save({
      gymId: gym.id,
      studentId: student.id,
      date: '2026-03-02',
      hasWorkout: true,
      hasMeal: false,
    });

    const meal = buildManualMeal(
      gym.id,
      student.id,
      '2026-03-02',
      'lunch',
      'Frango com arroz',
      { kcal: 500, protein: 40, carbs: 50, fat: 10 },
      'manual',
    );
    await saveMealEntry(meal);

    const [year, month] = [2026, 3];
    const days = await activityRepository.listByMonth(gym.id, student.id, year, month);
    const day = days.find((d) => d.date === '2026-03-02');
    expect(day?.hasMeal).toBe(true);
    expect(day?.hasWorkout).toBe(true); // não apagou o sinal de treino do mesmo dia

    await removeMealEntry(gym.id, student.id, meal.id, '2026-03-02');

    expect(await nutritionRepository.listMeals(gym.id, student.id, '2026-03-02')).toEqual([]);
    const daysAfterRemove = await activityRepository.listByMonth(gym.id, student.id, year, month);
    const dayAfterRemove = daysAfterRemove.find((d) => d.date === '2026-03-02');
    expect(dayAfterRemove?.hasMeal).toBe(false);
    expect(dayAfterRemove?.hasWorkout).toBe(true);
  });
});
