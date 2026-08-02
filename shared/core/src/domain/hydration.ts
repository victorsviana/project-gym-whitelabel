export const WATER_CUP_ML = 250;

export function addWaterCup(current: number, goal: number): number {
  return Math.min(goal, current + WATER_CUP_ML);
}

export function removeWaterCup(current: number): number {
  return Math.max(0, current - WATER_CUP_ML);
}

export function computeTotalCups(goal: number): number {
  return Math.round(goal / WATER_CUP_ML);
}

export function computeFilledCups(current: number): number {
  return Math.round(current / WATER_CUP_ML);
}
