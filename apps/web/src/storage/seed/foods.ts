/**
 * Base global de alimentos (`gymId: null`), valores por 100 g. Vem da `foodsDB` do protótipo
 * (`prototype/extracted/logic.js`), reaproveitada como base única — o protótipo tinha duas
 * listas paralelas de comida (defeito #7 de PROTOTYPE-AUDIT.md); aqui as "sugestões rápidas"
 * são só porções pré-definidas sobre esta mesma base, não uma lista separada.
 */
export interface SeedFood {
  slug: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultQuantity: number;
}

export const SEED_FOODS: SeedFood[] = [
  { slug: 'ovo', name: 'Ovo inteiro', kcal: 155, protein: 13, carbs: 1.1, fat: 11, defaultQuantity: 100 },
  {
    slug: 'frango',
    name: 'Peito de frango grelhado',
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    defaultQuantity: 150,
  },
  { slug: 'patinho', name: 'Patinho moído', kcal: 187, protein: 26, carbs: 0, fat: 9, defaultQuantity: 120 },
  {
    slug: 'arroz',
    name: 'Arroz branco cozido',
    kcal: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    defaultQuantity: 150,
  },
  {
    slug: 'batata',
    name: 'Batata doce cozida',
    kcal: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    defaultQuantity: 200,
  },
  { slug: 'feijao', name: 'Feijão cozido', kcal: 76, protein: 4.8, carbs: 14, fat: 0.5, defaultQuantity: 100 },
  { slug: 'aveia', name: 'Aveia em flocos', kcal: 389, protein: 17, carbs: 66, fat: 7, defaultQuantity: 40 },
  { slug: 'pao', name: 'Pão integral', kcal: 250, protein: 9, carbs: 45, fat: 3, defaultQuantity: 50 },
  { slug: 'banana', name: 'Banana', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultQuantity: 120 },
  {
    slug: 'whey',
    name: 'Whey protein (pó)',
    kcal: 400,
    protein: 80,
    carbs: 8,
    fat: 5,
    defaultQuantity: 30,
  },
  {
    slug: 'amendoim',
    name: 'Pasta de amendoim',
    kcal: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    defaultQuantity: 20,
  },
  {
    slug: 'leite',
    name: 'Leite desnatado',
    kcal: 35,
    protein: 3.4,
    carbs: 5,
    fat: 0.1,
    defaultQuantity: 200,
  },
];
