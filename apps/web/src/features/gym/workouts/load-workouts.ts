import type { WorkoutPlan } from '@gym/core';
import { workoutRepository } from '../../../storage';

export interface PlanRow {
  plan: WorkoutPlan;
  assignedCount: number;
}

export async function loadPlanRows(gymId: string): Promise<PlanRow[]> {
  const plans = await workoutRepository.listPlans(gymId);

  const rows = await Promise.all(
    plans.map(async (plan) => {
      const assignments = await workoutRepository.listAssignmentsForPlan(gymId, plan.id);
      return { plan, assignedCount: assignments.filter((assignment) => assignment.active).length };
    }),
  );

  return rows.sort((a, b) => a.plan.letter.localeCompare(b.plan.letter, 'pt-BR'));
}
