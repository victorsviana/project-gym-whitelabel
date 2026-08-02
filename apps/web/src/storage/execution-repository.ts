import type { ExecutionRepository, LoadLog, SetLog } from '@gym/core';
import { loadData, saveData } from './store';

export function createExecutionRepository(): ExecutionRepository {
  return {
    async listSetLogs(gymId, studentId, planId, date) {
      return loadData().setLogs.filter(
        (log) =>
          log.gymId === gymId &&
          log.studentId === studentId &&
          log.planId === planId &&
          log.date === date,
      );
    },

    async markSetLog(log: SetLog) {
      const data = loadData();
      const index = data.setLogs.findIndex((existing) => existing.id === log.id);
      if (index === -1) {
        data.setLogs.push(log);
      } else {
        data.setLogs[index] = log;
      }
      saveData(data);
    },

    async removeSetLog(gymId, setLogId) {
      const data = loadData();
      data.setLogs = data.setLogs.filter((log) => !(log.gymId === gymId && log.id === setLogId));
      saveData(data);
    },

    async listLoadLogs(gymId, studentId, planId, exerciseId) {
      return loadData()
        .loadLogs.filter(
          (log) =>
            log.gymId === gymId &&
            log.studentId === studentId &&
            log.planId === planId &&
            log.exerciseId === exerciseId,
        )
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    },

    async saveLoadLog(log: LoadLog) {
      const data = loadData();
      const index = data.loadLogs.findIndex(
        (existing) =>
          existing.gymId === log.gymId &&
          existing.studentId === log.studentId &&
          existing.planId === log.planId &&
          existing.exerciseId === log.exerciseId &&
          existing.date === log.date,
      );
      if (index === -1) {
        data.loadLogs.push(log);
      } else {
        data.loadLogs[index] = log;
      }
      saveData(data);
    },
  };
}
