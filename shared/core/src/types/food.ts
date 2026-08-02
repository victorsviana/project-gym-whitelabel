/** Base de alimentos, valores por 100 g. gymId null = base global. */
export interface Food {
  id: string;
  gymId: string | null;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultQuantity: number;
}
