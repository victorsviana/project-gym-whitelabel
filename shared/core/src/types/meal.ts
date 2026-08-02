import type { IsoDate } from '../dates';
import type { MealSource, MealType } from './common';

export interface Meal {
  id: string;
  gymId: string;
  studentId: string;
  date: IsoDate;
  type: MealType;
  name: string;
  /** g. */
  quantity?: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  source: MealSource;
  createdAt: string;
}
