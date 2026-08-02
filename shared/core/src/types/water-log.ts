import type { IsoDate } from '../dates';

/** Um registro por dia. */
export interface WaterLog {
  gymId: string;
  studentId: string;
  date: IsoDate;
  /** ml. */
  amount: number;
}
