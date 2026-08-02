import type { Notice } from '../types';

/** Pendências do painel da academia. */
export interface NoticeRepository {
  listByGym(gymId: string, resolved?: boolean): Promise<Notice[]>;
  /** Upsert por `id`. */
  save(notice: Notice): Promise<void>;
}
