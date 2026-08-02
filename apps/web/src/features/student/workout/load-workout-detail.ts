import type { BodyRegion, IsoDate, LoadLog, SetLog, WorkoutPlan } from '@gym/core';
import { computeLoadDelta, isAdaptedExercise, suggestInitialLoad } from '@gym/core';
import { executionRepository, userRepository, workoutRepository } from '../../../storage';

export interface ExerciseDetail {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  sensitiveRegions: readonly BodyRegion[];
  adapted: boolean;
  /** setIndex -> série marcada, para saber o `id` a remover ao desmarcar. */
  completedSets: ReadonlyMap<number, SetLog>;
  /** Ordenado da mais antiga para a mais recente. */
  loadHistory: LoadLog[];
  suggestedLoad: number;
  loadDelta: number;
}

export interface WorkoutDetail {
  plan: WorkoutPlan;
  trainerName: string | null;
  exercises: ExerciseDetail[];
}

/**
 * Só considera planos publicados e atribuídos ao aluno (mesmo filtro de `listPlansForStudent`) —
 * navegar direto para o id de um plano alheio ou não publicado não deve abrir a execução dele.
 */
export async function loadWorkoutDetail(
  gymId: string,
  studentId: string,
  planId: string,
  injuries: readonly BodyRegion[],
  date: IsoDate,
): Promise<WorkoutDetail | null> {
  const plans = await workoutRepository.listPlansForStudent(gymId, studentId);
  const plan = plans.find((candidate) => candidate.id === planId);
  if (!plan) return null;

  const [trainer, setLogs] = await Promise.all([
    userRepository.findById(gymId, plan.createdBy),
    executionRepository.listSetLogs(gymId, studentId, planId, date),
  ]);

  const completedByExercise = new Map<string, Map<number, SetLog>>();
  for (const log of setLogs) {
    const bySetIndex = completedByExercise.get(log.exerciseId) ?? new Map<number, SetLog>();
    bySetIndex.set(log.setIndex, log);
    completedByExercise.set(log.exerciseId, bySetIndex);
  }

  const exercises = await Promise.all(
    plan.exercises
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(async (exercise): Promise<ExerciseDetail> => {
        const history = await executionRepository.listLoadLogs(gymId, studentId, planId, exercise.id);
        const lastWeight = history.length ? history[history.length - 1].weight : null;
        return {
          exerciseId: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          sensitiveRegions: exercise.sensitiveRegions,
          adapted: isAdaptedExercise(exercise.sensitiveRegions, injuries),
          completedSets: completedByExercise.get(exercise.id) ?? new Map<number, SetLog>(),
          loadHistory: history,
          suggestedLoad: suggestInitialLoad(lastWeight),
          loadDelta: computeLoadDelta(history.map((log) => log.weight)),
        };
      }),
  );

  return { plan, trainerName: trainer?.name ?? null, exercises };
}
