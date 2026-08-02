import type { StudentProfile, StudentStatus, User, WorkoutPlan } from '@gym/core';
import { computeStudentStatus } from '@gym/core';
import { studentRepository, userRepository, workoutRepository } from '../../../storage';
import { loadOpenNotices, openNoticeStudentIds } from '../notices/load-notices';

export interface StudentRow {
  user: User;
  profile: StudentProfile | null;
  status: StudentStatus;
  /** Planos ativos, no formato "A · Peito e Tríceps". */
  planNames: string[];
}

export async function loadStudentRows(gymId: string): Promise<StudentRow[]> {
  const [users, profiles, plans, studentIdsWithOpenNotice] = await Promise.all([
    userRepository.listByGym(gymId, 'student'),
    studentRepository.listProfiles(gymId),
    workoutRepository.listPlans(gymId),
    openNoticeStudentIds(gymId),
  ]);

  const profileByStudent = new Map(profiles.map((profile) => [profile.studentId, profile]));
  const planById = new Map(plans.map((plan) => [plan.id, plan]));

  const rows = await Promise.all(
    users.map(async (user) => {
      const assignments = (await workoutRepository.listAssignmentsForStudent(gymId, user.id)).filter(
        (assignment) => assignment.active,
      );
      const planNames = assignments
        .map((assignment) => planById.get(assignment.planId))
        .filter((plan): plan is WorkoutPlan => plan !== undefined)
        .map((plan) => `${plan.letter} · ${plan.name}`);

      return {
        user,
        profile: profileByStudent.get(user.id) ?? null,
        status: computeStudentStatus({
          hasActiveAssignment: assignments.length > 0,
          hasOpenNotice: studentIdsWithOpenNotice.has(user.id),
        }),
        planNames,
      };
    }),
  );

  return rows.sort((a, b) => a.user.name.localeCompare(b.user.name, 'pt-BR'));
}

export interface GymDashboard {
  activeStudents: number;
  studentsWithoutPlan: number;
  openNotices: number;
  publishedPlans: number;
}

export async function loadGymDashboard(gymId: string): Promise<GymDashboard> {
  const [rows, plans, notices] = await Promise.all([
    loadStudentRows(gymId),
    workoutRepository.listPlans(gymId),
    loadOpenNotices(gymId),
  ]);

  return {
    activeStudents: rows.filter((row) => row.status === 'active').length,
    studentsWithoutPlan: rows.filter((row) => row.status === 'no_plan').length,
    openNotices: notices.length,
    publishedPlans: plans.filter((plan) => plan.published).length,
  };
}
