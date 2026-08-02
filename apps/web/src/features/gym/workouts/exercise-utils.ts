import type { PlanExercise, WorkoutPlan } from '@gym/core';
import { createId } from '@gym/core';

function renumbered(exercises: PlanExercise[]): PlanExercise[] {
  return exercises.map((exercise, order) => ({ ...exercise, order }));
}

export function reorderExercises(
  exercises: PlanExercise[],
  index: number,
  direction: -1 | 1,
): PlanExercise[] {
  const target = index + direction;
  if (target < 0 || target >= exercises.length) return exercises;
  const next = [...exercises];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return renumbered(next);
}

/** Upsert por `id` — usado tanto para adicionar quanto para editar um exercício do plano. */
export function withExercise(exercises: PlanExercise[], exercise: PlanExercise): PlanExercise[] {
  const index = exercises.findIndex((existing) => existing.id === exercise.id);
  const next =
    index === -1
      ? [...exercises, exercise]
      : exercises.map((existing, i) => (i === index ? exercise : existing));
  return renumbered(next);
}

export function withoutExercise(exercises: PlanExercise[], exerciseId: string): PlanExercise[] {
  return renumbered(exercises.filter((exercise) => exercise.id !== exerciseId));
}

/** Cópia do plano com novos ids (plano e exercícios), sempre como rascunho — mesmo que o original estivesse publicado. */
export function buildDuplicatePlan(plan: WorkoutPlan, generateId: () => string = createId): WorkoutPlan {
  const now = new Date().toISOString();
  return {
    ...plan,
    id: generateId(),
    name: `${plan.name} (cópia)`,
    published: false,
    exercises: plan.exercises.map((exercise) => ({ ...exercise, id: generateId() })),
    createdAt: now,
    updatedAt: now,
  };
}
