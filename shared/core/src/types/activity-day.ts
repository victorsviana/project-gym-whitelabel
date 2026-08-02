import type { IsoDate } from '../dates';

/** Cache de constância, derivado de SetLog e Meal. Pode ser recalculado a qualquer momento. */
export interface ActivityDay {
  gymId: string;
  studentId: string;
  date: IsoDate;
  hasWorkout: boolean;
  hasMeal: boolean;
}
