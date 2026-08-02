import type { IsoDate } from '../dates';

/** Uma série marcada como concluída. A data faz parte da chave — é o que garante reset diário. */
export interface SetLog {
  id: string;
  gymId: string;
  studentId: string;
  planId: string;
  exerciseId: string;
  setIndex: number;
  date: IsoDate;
  completedAt: string;
}
