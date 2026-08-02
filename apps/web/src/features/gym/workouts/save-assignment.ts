import { workoutRepository } from '../../../storage';

/** Aplica a seleção de alunos de um plano: ativa quem entrou, desativa quem saiu. */
export async function syncPlanAssignments(
  gymId: string,
  planId: string,
  selectedStudentIds: string[],
  assignedBy: string,
): Promise<void> {
  const active = (await workoutRepository.listAssignmentsForPlan(gymId, planId)).filter(
    (assignment) => assignment.active,
  );
  const activeStudentIds = new Set(active.map((assignment) => assignment.studentId));
  const toAssign = selectedStudentIds.filter((studentId) => !activeStudentIds.has(studentId));
  const toUnassign = active.filter((assignment) => !selectedStudentIds.includes(assignment.studentId));

  if (toAssign.length > 0) await workoutRepository.assign(gymId, planId, toAssign, assignedBy);
  await Promise.all(toUnassign.map((assignment) => workoutRepository.unassign(gymId, assignment.id)));
}

/** Mesma lógica, mas partindo do aluno: aplica a seleção de planos atribuídos a ele. */
export async function syncStudentAssignments(
  gymId: string,
  studentId: string,
  selectedPlanIds: string[],
  assignedBy: string,
): Promise<void> {
  const active = (await workoutRepository.listAssignmentsForStudent(gymId, studentId)).filter(
    (assignment) => assignment.active,
  );
  const activePlanIds = new Set(active.map((assignment) => assignment.planId));
  const toAssign = selectedPlanIds.filter((planId) => !activePlanIds.has(planId));
  const toUnassign = active.filter((assignment) => !selectedPlanIds.includes(assignment.planId));

  await Promise.all(toAssign.map((planId) => workoutRepository.assign(gymId, planId, [studentId], assignedBy)));
  await Promise.all(toUnassign.map((assignment) => workoutRepository.unassign(gymId, assignment.id)));
}
