import type { DailyGoal, StudentProfile, StudentRepository } from '@gym/core';
import { loadData, saveData } from './store';

export function createStudentRepository(): StudentRepository {
  return {
    async findProfile(gymId, studentId) {
      return (
        loadData().profiles.find(
          (profile) => profile.gymId === gymId && profile.studentId === studentId,
        ) ?? null
      );
    },

    async listProfiles(gymId) {
      return loadData().profiles.filter((profile) => profile.gymId === gymId);
    },

    async saveProfile(profile: StudentProfile) {
      const data = loadData();
      const index = data.profiles.findIndex(
        (existing) => existing.gymId === profile.gymId && existing.studentId === profile.studentId,
      );
      if (index === -1) {
        data.profiles.push(profile);
      } else {
        data.profiles[index] = profile;
      }
      saveData(data);
    },

    async findGoal(gymId, studentId) {
      return (
        loadData().goals.find((goal) => goal.gymId === gymId && goal.studentId === studentId) ??
        null
      );
    },

    async saveGoal(goal: DailyGoal) {
      const data = loadData();
      const index = data.goals.findIndex(
        (existing) => existing.gymId === goal.gymId && existing.studentId === goal.studentId,
      );
      if (index === -1) {
        data.goals.push(goal);
      } else {
        data.goals[index] = goal;
      }
      saveData(data);
    },
  };
}
