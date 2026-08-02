import { daysBetween, type IsoDate } from '../dates/iso-date';
import type { NoticeKind } from '../types/common';

/** DATA-MODEL.md#notice: `plan_change_request` não tem sinal nenhum no modelo que a derive. */
export type AutoNoticeKind = Extract<NoticeKind, 'new_student' | 'reassessment'>;

export const REASSESSMENT_THRESHOLD_DAYS = 30;

export interface AutoNoticeInput {
  hasActiveAssignment: boolean;
  /** null quando o aluno ainda não tem `StudentProfile` — não faz sentido cobrar reavaliação de quem nunca foi avaliado. */
  lastAssessedAt: IsoDate | null;
  today: IsoDate;
}

/**
 * Pendências que se derivam sozinhas do estado atual (DATA-MODEL.md): sem atribuição ativa
 * gera `new_student`, avaliação com mais de 30 dias gera `reassessment`. Um aluno pode acumular
 * as duas ao mesmo tempo — não há prioridade aqui (diferente de `computeStudentStatus`).
 */
export function deriveAutoNoticeKinds(input: AutoNoticeInput): AutoNoticeKind[] {
  const kinds: AutoNoticeKind[] = [];
  if (!input.hasActiveAssignment) kinds.push('new_student');
  if (input.lastAssessedAt && daysBetween(input.lastAssessedAt, input.today) > REASSESSMENT_THRESHOLD_DAYS) {
    kinds.push('reassessment');
  }
  return kinds;
}
