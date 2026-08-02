import type { NoticeKind } from '@gym/core';
import { deriveAutoNoticeKinds, toIsoDate, todayIsoDate } from '@gym/core';
import { noticeRepository, studentRepository, userRepository, workoutRepository } from '../../../storage';
import { AUTO_NOTICE_TEXT } from './labels';

export interface NoticeRow {
  id: string;
  kind: NoticeKind;
  studentId: string;
  studentName: string;
  text: string;
  /** Data de referência para "tempo decorrido" (UI-SPEC.md#avisos). */
  since: string;
  /** `new_student`/`reassessment` se resolvem sozinhos quando a causa desaparece; `plan_change_request` precisa de "Resolver" manual. */
  auto: boolean;
}

/**
 * Fila de pendências abertas da academia: `new_student`/`reassessment` são recalculadas a cada
 * leitura a partir do estado atual (DATA-MODEL.md#notice), `plan_change_request` continua vindo
 * do registro gravado (não tem sinal no modelo que a derive — ver STATE.md F1-E15).
 */
export async function loadOpenNotices(gymId: string): Promise<NoticeRow[]> {
  const [students, profiles, storedNotices] = await Promise.all([
    userRepository.listByGym(gymId, 'student'),
    studentRepository.listProfiles(gymId),
    noticeRepository.listByGym(gymId, false),
  ]);

  const profileByStudent = new Map(profiles.map((profile) => [profile.studentId, profile]));
  const today = todayIsoDate();
  const rows: NoticeRow[] = [];

  await Promise.all(
    students.map(async (student) => {
      const assignments = await workoutRepository.listAssignmentsForStudent(gymId, student.id);
      const hasActiveAssignment = assignments.some((assignment) => assignment.active);
      const profile = profileByStudent.get(student.id) ?? null;

      const kinds = deriveAutoNoticeKinds({
        hasActiveAssignment,
        lastAssessedAt: profile?.lastAssessedAt ?? null,
        today,
      });

      for (const kind of kinds) {
        rows.push({
          id: `auto:${kind}:${student.id}`,
          kind,
          studentId: student.id,
          studentName: student.name,
          text: AUTO_NOTICE_TEXT[kind],
          since: kind === 'new_student' ? toIsoDate(new Date(student.createdAt)) : (profile?.lastAssessedAt ?? today),
          auto: true,
        });
      }
    }),
  );

  const studentById = new Map(students.map((student) => [student.id, student]));
  for (const notice of storedNotices) {
    if (notice.kind !== 'plan_change_request') continue;
    rows.push({
      id: notice.id,
      kind: notice.kind,
      studentId: notice.studentId,
      studentName: studentById.get(notice.studentId)?.name ?? '—',
      text: notice.text,
      since: toIsoDate(new Date(notice.createdAt)),
      auto: false,
    });
  }

  return rows.sort((a, b) => a.since.localeCompare(b.since));
}

export async function openNoticeStudentIds(gymId: string): Promise<Set<string>> {
  const rows = await loadOpenNotices(gymId);
  return new Set(rows.map((row) => row.studentId));
}

/** Só resolve pendências manuais (`plan_change_request`) — as automáticas se fecham sozinhas quando a causa some. */
export async function resolvePlanChangeRequest(gymId: string, noticeId: string): Promise<void> {
  const notices = await noticeRepository.listByGym(gymId);
  const notice = notices.find((existing) => existing.id === noticeId);
  if (!notice) return;

  await noticeRepository.save({
    ...notice,
    resolved: true,
    resolvedAt: new Date().toISOString(),
  });
}
