import type { Notice, NoticeRepository } from '@gym/core';
import { loadData, saveData } from './store';

export function createNoticeRepository(): NoticeRepository {
  return {
    async listByGym(gymId, resolved) {
      return loadData().notices.filter(
        (notice) => notice.gymId === gymId && (resolved === undefined || notice.resolved === resolved),
      );
    },

    async save(notice: Notice) {
      const data = loadData();
      const index = data.notices.findIndex((existing) => existing.id === notice.id);
      if (index === -1) {
        data.notices.push(notice);
      } else {
        data.notices[index] = notice;
      }
      saveData(data);
    },
  };
}
