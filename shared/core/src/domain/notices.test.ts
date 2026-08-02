import { describe, expect, it } from 'vitest';
import { deriveAutoNoticeKinds } from './notices';

describe('deriveAutoNoticeKinds', () => {
  it('sem atribuição ativa gera new_student, como Bruno e Ana no seed', () => {
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: false,
        lastAssessedAt: '2026-08-01',
        today: '2026-08-01',
      }),
    ).toEqual(['new_student']);
  });

  it('avaliação há mais de 30 dias gera reassessment, como Diego no seed', () => {
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: true,
        lastAssessedAt: '2026-06-01',
        today: '2026-08-01',
      }),
    ).toEqual(['reassessment']);
  });

  it('exatamente 30 dias ainda não conta — o limiar é "mais de 30"', () => {
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: true,
        lastAssessedAt: '2026-07-02',
        today: '2026-08-01',
      }),
    ).toEqual([]);
  });

  it('sem perfil (lastAssessedAt null) não cobra reavaliação de quem nunca foi avaliado', () => {
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: true,
        lastAssessedAt: null,
        today: '2026-08-01',
      }),
    ).toEqual([]);
  });

  it('pode acumular os dois ao mesmo tempo, sem prioridade entre eles', () => {
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: false,
        lastAssessedAt: '2026-06-01',
        today: '2026-08-01',
      }),
    ).toEqual(['new_student', 'reassessment']);
  });

  it('com atribuição ativa e avaliação recente, aluno ativo sem pendência nenhuma', () => {
    expect(
      deriveAutoNoticeKinds({
        hasActiveAssignment: true,
        lastAssessedAt: '2026-07-25',
        today: '2026-08-01',
      }),
    ).toEqual([]);
  });
});
