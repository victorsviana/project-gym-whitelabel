import type { BodyRegion } from './common';

export interface PlanExercise {
  id: string;
  name: string;
  sets: number;
  /** Texto de propósito: aceita faixas ("8–10") e tempo ("40s"). */
  reps: string;
  order: number;
  sensitiveRegions: BodyRegion[];
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  gymId: string;
  /** "A", "B", … */
  letter: string;
  name: string;
  focus: string;
  weekday: string;
  duration: string;
  exercises: PlanExercise[];
  /** Rascunho não aparece para o aluno. */
  published: boolean;
  /** Id do professor. */
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
