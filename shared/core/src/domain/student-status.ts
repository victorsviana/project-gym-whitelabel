import type { StudentStatus } from '../types';

export interface StudentStatusInput {
  hasActiveAssignment: boolean;
  hasOpenNotice: boolean;
}

/** Sem plano tem prioridade sobre pendência: aluno sem treino ainda não tem o que revisar. */
export function computeStudentStatus(input: StudentStatusInput): StudentStatus {
  if (!input.hasActiveAssignment) return 'no_plan';
  if (input.hasOpenNotice) return 'needs_review';
  return 'active';
}
