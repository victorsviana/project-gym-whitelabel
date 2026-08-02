import type { BodyRegion, Goal, Level, Restriction, Sex, StudentProfile } from '@gym/core';
import { computeDailyGoal } from '@gym/core';
import { studentRepository } from '../../../storage';

export interface AssessmentInput {
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  injuries: BodyRegion[];
  restrictions: Restriction[];
}

/**
 * Professor preenchendo (ou editando) a avaliação de um aluno. Recalcula as metas diárias a partir
 * dos mesmos dados, como o onboarding do próprio aluno faria (DOMAIN-RULES.md).
 */
export async function saveStudentAssessment(
  gymId: string,
  studentId: string,
  input: AssessmentInput,
): Promise<void> {
  const existing = await studentRepository.findProfile(gymId, studentId);
  const now = new Date().toISOString();

  const profile: StudentProfile = {
    studentId,
    gymId,
    ...input,
    onboardedAt: existing?.onboardedAt ?? now,
  };
  await studentRepository.saveProfile(profile);

  const computed = computeDailyGoal(input);
  await studentRepository.saveGoal({
    studentId,
    gymId,
    kcal: computed.kcal,
    protein: computed.protein,
    carbs: computed.carbs,
    fat: computed.fat,
    water: computed.water,
    source: 'computed',
    updatedAt: now,
  });
}
