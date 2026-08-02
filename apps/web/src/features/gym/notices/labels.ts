import type { NoticeKind } from '@gym/core';

export const NOTICE_KIND_LABELS: Record<NoticeKind, string> = {
  new_student: 'Aluno novo',
  reassessment: 'Reavaliação',
  plan_change_request: 'Troca de treino',
};

/** Texto das pendências derivadas (`new_student`/`reassessment`) — `plan_change_request` usa o texto gravado pelo professor. */
export const AUTO_NOTICE_TEXT: Record<'new_student' | 'reassessment', string> = {
  new_student: 'Novo aluno — monte o primeiro treino',
  reassessment: 'Avaliação feita há mais de 30 dias — reavaliação recomendada',
};

export const NOTICE_SHORTCUT_LABELS: Record<NoticeKind, string> = {
  new_student: 'Atribuir treino',
  reassessment: 'Editar avaliação',
  plan_change_request: 'Ver ficha',
};
