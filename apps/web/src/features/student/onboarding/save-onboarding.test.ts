import { beforeEach, describe, expect, it } from 'vitest';
import { studentRepository } from '../../../storage';
import { completeOnboarding } from './save-onboarding';
import type { OnboardingAnswers } from './types';

beforeEach(() => {
  localStorage.clear();
});

describe('completeOnboarding', () => {
  // Caso A de DOMAIN-RULES.md §1.8 — mesmo caso de referência de computeDailyGoal.
  const answers: OnboardingAnswers = {
    sex: 'male',
    age: 29,
    weight: 78,
    height: 179,
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 5,
    injuries: [],
    restrictions: [],
  };

  it('salva o perfil com onboardedAt preenchido', async () => {
    await completeOnboarding('gym-1', 'student-1', answers);

    const profile = await studentRepository.findProfile('gym-1', 'student-1');
    expect(profile).toMatchObject({ studentId: 'student-1', gymId: 'gym-1', ...answers });
    expect(profile?.onboardedAt).not.toBeNull();
  });

  it('calcula e salva as metas diárias batendo com o caso de referência', async () => {
    await completeOnboarding('gym-1', 'student-1', answers);

    const goal = await studentRepository.findGoal('gym-1', 'student-1');
    expect(goal).toMatchObject({
      kcal: 3000,
      protein: 156,
      carbs: 455,
      fat: 62,
      water: 3250,
      source: 'computed',
    });
  });
});
