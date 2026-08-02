import type { BodyRegion, Goal, Level, Restriction, Sex } from './common';

export interface StudentProfile {
  studentId: string;
  gymId: string;
  /** Usado só no cálculo de TMB. */
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  injuries: BodyRegion[];
  restrictions: Restriction[];
  /** null = onboarding pendente. */
  onboardedAt: string | null;
}
