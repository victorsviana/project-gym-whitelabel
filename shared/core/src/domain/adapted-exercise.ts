import type { BodyRegion } from '../types';

/** Marcado quando o exercício sobrecarrega uma região que o aluno declarou lesionada. */
export function isAdaptedExercise(sensitiveRegions: readonly BodyRegion[], injuries: readonly BodyRegion[]): boolean {
  return sensitiveRegions.some((region) => injuries.includes(region));
}

/** O plano recebe o selo se contiver ao menos um exercício adaptado. */
export function isAdaptedPlan(
  exercises: readonly { sensitiveRegions: readonly BodyRegion[] }[],
  injuries: readonly BodyRegion[],
): boolean {
  return exercises.some((exercise) => isAdaptedExercise(exercise.sensitiveRegions, injuries));
}
