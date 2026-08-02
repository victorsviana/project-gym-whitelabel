import { createId, type WorkoutPlan, type WorkoutRepository } from '@gym/core';
import { loadData, saveData } from './store';

export function createWorkoutRepository(): WorkoutRepository {
  return {
    async listPlans(gymId) {
      return loadData().plans.filter((plan) => plan.gymId === gymId);
    },

    async listPlansForStudent(gymId, studentId) {
      const data = loadData();
      const assignments = data.assignments
        .filter((a) => a.gymId === gymId && a.studentId === studentId && a.active)
        .sort((a, b) => a.order - b.order);

      const plansById = new Map(data.plans.map((plan) => [plan.id, plan]));

      return assignments
        .map((assignment) => plansById.get(assignment.planId))
        .filter((plan): plan is WorkoutPlan => plan !== undefined && plan.gymId === gymId && plan.published);
    },

    async findPlanById(gymId, planId) {
      return loadData().plans.find((plan) => plan.gymId === gymId && plan.id === planId) ?? null;
    },

    async savePlan(plan: WorkoutPlan) {
      const data = loadData();
      const index = data.plans.findIndex((existing) => existing.id === plan.id);
      if (index === -1) {
        data.plans.push(plan);
      } else {
        data.plans[index] = plan;
      }
      saveData(data);
    },

    async deletePlan(gymId, planId) {
      const data = loadData();
      data.plans = data.plans.filter((plan) => !(plan.gymId === gymId && plan.id === planId));
      saveData(data);
    },

    async listAssignmentsForPlan(gymId, planId) {
      return loadData().assignments.filter((a) => a.gymId === gymId && a.planId === planId);
    },

    async listAssignmentsForStudent(gymId, studentId) {
      return loadData().assignments.filter(
        (a) => a.gymId === gymId && a.studentId === studentId,
      );
    },

    async assign(gymId, planId, studentIds, assignedBy) {
      const data = loadData();
      const assignedAt = new Date().toISOString();

      for (const studentId of studentIds) {
        const existing = data.assignments.find(
          (a) => a.gymId === gymId && a.planId === planId && a.studentId === studentId,
        );

        if (existing) {
          existing.active = true;
          existing.assignedAt = assignedAt;
          existing.assignedBy = assignedBy;
          continue;
        }

        const order = data.assignments.filter(
          (a) => a.gymId === gymId && a.studentId === studentId && a.active,
        ).length;

        data.assignments.push({
          id: createId(),
          gymId,
          planId,
          studentId,
          order,
          active: true,
          assignedAt,
          assignedBy,
        });
      }

      saveData(data);
    },

    async unassign(gymId, assignmentId) {
      const data = loadData();
      const assignment = data.assignments.find((a) => a.gymId === gymId && a.id === assignmentId);
      if (assignment) assignment.active = false;
      saveData(data);
    },
  };
}
