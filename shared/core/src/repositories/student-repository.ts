import type { DailyGoal, StudentProfile } from '../types';

/** Perfil, avaliação e metas do aluno. */
export interface StudentRepository {
  findProfile(gymId: string, studentId: string): Promise<StudentProfile | null>;
  /** Todos os perfis da academia — usado pela lista de alunos do painel. */
  listProfiles(gymId: string): Promise<StudentProfile[]>;
  /** Upsert por `studentId`. */
  saveProfile(profile: StudentProfile): Promise<void>;

  findGoal(gymId: string, studentId: string): Promise<DailyGoal | null>;
  /** Upsert por `studentId`. */
  saveGoal(goal: DailyGoal): Promise<void>;
}
