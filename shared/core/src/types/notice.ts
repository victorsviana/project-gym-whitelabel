import type { NoticeKind } from './common';

export interface Notice {
  id: string;
  gymId: string;
  studentId: string;
  kind: NoticeKind;
  text: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}
