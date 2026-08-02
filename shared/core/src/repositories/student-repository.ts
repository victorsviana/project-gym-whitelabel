import type { DailyGoal, StudentPreferences, StudentProfile } from '../types';

/** Perfil, avaliação, metas e preferências do aluno. */
export interface StudentRepository {
  findProfile(gymId: string, studentId: string): Promise<StudentProfile | null>;
  /** Todos os perfis da academia — usado pela lista de alunos do painel. */
  listProfiles(gymId: string): Promise<StudentProfile[]>;
  /** Upsert por `studentId`. */
  saveProfile(profile: StudentProfile): Promise<void>;

  findGoal(gymId: string, studentId: string): Promise<DailyGoal | null>;
  /** Upsert por `studentId`. */
  saveGoal(goal: DailyGoal): Promise<void>;

  /** null = ainda não configurou nada — quem chama aplica os padrões (`defaultNotificationPreferences`). */
  findPreferences(gymId: string, studentId: string): Promise<StudentPreferences | null>;
  /** Upsert por `studentId`. */
  savePreferences(preferences: StudentPreferences): Promise<void>;
}
