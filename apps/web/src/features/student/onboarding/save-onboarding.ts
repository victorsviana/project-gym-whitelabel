import type { DailyGoal, StudentProfile } from '@gym/core';
import { computeDailyGoal } from '@gym/core';
import { studentRepository } from '../../../storage';
import type { OnboardingAnswers } from './types';

/** Primeira avaliação do aluno — grava perfil e metas calculadas (DOMAIN-RULES.md). */
export async function completeOnboarding(
  gymId: string,
  studentId: string,
  answers: OnboardingAnswers,
): Promise<void> {
  const now = new Date().toISOString();

  const profile: StudentProfile = {
    studentId,
    gymId,
    ...answers,
    onboardedAt: now,
  };
  await studentRepository.saveProfile(profile);

  const computed = computeDailyGoal(answers);
  const goal: DailyGoal = {
    studentId,
    gymId,
    kcal: computed.kcal,
    protein: computed.protein,
    carbs: computed.carbs,
    fat: computed.fat,
    water: computed.water,
    source: 'computed',
    updatedAt: now,
  };
  await studentRepository.saveGoal(goal);
}
