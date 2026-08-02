import type { IsoDate } from '../dates/iso-date';
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
  /** Data da avaliação mais recente (onboarding ou reavaliação pelo professor) — base da pendência de reavaliação (F1-E15). */
  lastAssessedAt: IsoDate;
}
