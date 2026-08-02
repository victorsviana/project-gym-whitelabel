import type { IsoDate } from '../dates';

/** Chave lógica única: studentId + planId + exerciseId + date. Registrar de novo no mesmo dia sobrescreve. */
export interface LoadLog {
  id: string;
  gymId: string;
  studentId: string;
  planId: string;
  exerciseId: string;
  date: IsoDate;
  /** kg. */
  weight: number;
  updatedAt: string;
}
