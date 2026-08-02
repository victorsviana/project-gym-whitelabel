import type { GoalSource } from './common';

export interface DailyGoal {
  studentId: string;
  gymId: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Em ml. */
  water: number;
  source: GoalSource;
  updatedAt: string;
}
