import type { ActivityDay, ActivityRepository } from '@gym/core';
import { loadData, saveData } from './store';

function monthPrefix(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function createActivityRepository(): ActivityRepository {
  return {
    async listByMonth(gymId, studentId, year, month) {
      const prefix = monthPrefix(year, month);
      return loadData().activity.filter(
        (day) =>
          day.gymId === gymId && day.studentId === studentId && day.date.startsWith(prefix),
      );
    },

    async save(day: ActivityDay) {
      const data = loadData();
      const index = data.activity.findIndex(
        (existing) =>
          existing.gymId === day.gymId &&
          existing.studentId === day.studentId &&
          existing.date === day.date,
      );
      if (index === -1) {
        data.activity.push(day);
      } else {
        data.activity[index] = day;
      }
      saveData(data);
    },
  };
}
