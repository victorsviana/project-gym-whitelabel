import type { BodyRegion, IsoDate, WorkoutPlan } from '@gym/core';
import { computeWorkoutProgress, isAdaptedPlan, isPlanComplete } from '@gym/core';
import { executionRepository, userRepository, workoutRepository } from '../../../storage';

export interface WorkoutListRow {
  plan: WorkoutPlan;
  completedSets: number;
  totalSets: number;
  progress: number;
  complete: boolean;
  adapted: boolean;
}

export interface WorkoutListFooter {
  trainerName: string;
  updatedAt: string;
}

export interface WorkoutList {
  rows: WorkoutListRow[];
  /** Do plano atualizado mais recentemente — não existe um "professor da lista" único de verdade. */
  footer: WorkoutListFooter | null;
}

export async function loadWorkoutList(
  gymId: string,
  studentId: string,
  injuries: readonly BodyRegion[],
  today: IsoDate,
): Promise<WorkoutList> {
  const plans = await workoutRepository.listPlansForStudent(gymId, studentId);

  const rows = await Promise.all(
    plans.map(async (plan): Promise<WorkoutListRow> => {
      const setLogs = await executionRepository.listSetLogs(gymId, studentId, plan.id, today);
      const totalSets = plan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
      const progress = computeWorkoutProgress(totalSets, setLogs.length);
      return {
        plan,
        completedSets: setLogs.length,
        totalSets,
        progress,
        complete: isPlanComplete(progress),
        adapted: isAdaptedPlan(plan.exercises, injuries),
      };
    }),
  );

  if (plans.length === 0) return { rows, footer: null };

  const mostRecentPlan = plans.reduce((latest, plan) => (plan.updatedAt > latest.updatedAt ? plan : latest));
  const trainer = await userRepository.findById(gymId, mostRecentPlan.createdBy);

  return {
    rows,
    footer: trainer ? { trainerName: trainer.name, updatedAt: mostRecentPlan.updatedAt } : null,
  };
}
