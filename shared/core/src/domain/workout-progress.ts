/** Progresso relativo ao dia — séries de dias anteriores não contam. Retorna 0 quando não há séries no plano. */
export function computeWorkoutProgress(totalSets: number, completedSets: number): number {
  if (totalSets <= 0) return 0;
  return completedSets / totalSets;
}

export function isPlanComplete(progress: number): boolean {
  return progress >= 1;
}
