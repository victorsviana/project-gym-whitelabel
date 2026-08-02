import type { ActivityDay } from '../types';

/** Dias ativos e sequência. Dado derivado de SetLog e Meal — pode ser recalculado a qualquer momento. */
export interface ActivityRepository {
  /** `month` é 1–12. */
  listByMonth(gymId: string, studentId: string, year: number, month: number): Promise<ActivityDay[]>;
  /** Upsert pela chave lógica `studentId + date`. */
  save(day: ActivityDay): Promise<void>;
}
