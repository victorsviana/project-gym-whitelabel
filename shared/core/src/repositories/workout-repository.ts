import type { Assignment, WorkoutPlan } from '../types';

/** Planos, exercícios e atribuições. */
export interface WorkoutRepository {
  listPlans(gymId: string): Promise<WorkoutPlan[]>;
  /** Só planos publicados, atribuídos e ativos para o aluno, na ordem da atribuição. */
  listPlansForStudent(gymId: string, studentId: string): Promise<WorkoutPlan[]>;
  findPlanById(gymId: string, planId: string): Promise<WorkoutPlan | null>;
  /** Upsert por `id`. */
  savePlan(plan: WorkoutPlan): Promise<void>;
  deletePlan(gymId: string, planId: string): Promise<void>;

  listAssignmentsForPlan(gymId: string, planId: string): Promise<Assignment[]>;
  listAssignmentsForStudent(gymId: string, studentId: string): Promise<Assignment[]>;
  assign(gymId: string, planId: string, studentIds: string[], assignedBy: string): Promise<void>;
  /** Desativa a atribuição — some do aluno sem apagar o histórico. */
  unassign(gymId: string, assignmentId: string): Promise<void>;
}
