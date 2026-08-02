import type { IsoDate } from '../dates';
import type { Food, Meal, WaterLog } from '../types';

/** Refeições, água e a base de alimentos. */
export interface NutritionRepository {
  listMeals(gymId: string, studentId: string, date: IsoDate): Promise<Meal[]>;
  /** `from` e `to` inclusive. */
  listMealsInRange(
    gymId: string,
    studentId: string,
    from: IsoDate,
    to: IsoDate,
  ): Promise<Meal[]>;
  saveMeal(meal: Meal): Promise<void>;
  removeMeal(gymId: string, mealId: string): Promise<void>;

  findWaterLog(gymId: string, studentId: string, date: IsoDate): Promise<WaterLog | null>;
  /** Upsert pela chave lógica `studentId + date`. */
  saveWaterLog(log: WaterLog): Promise<void>;

  /** Base global mais a base própria da academia, se houver. */
  listFoods(gymId: string): Promise<Food[]>;
}
