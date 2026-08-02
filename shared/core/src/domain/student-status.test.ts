import { describe, expect, it } from 'vitest';
import { computeStudentStatus } from './student-status';

describe('computeStudentStatus', () => {
  it('sem atribuição ativa é "sem treino", como Bruno e Ana no seed', () => {
    expect(computeStudentStatus({ hasActiveAssignment: false, hasOpenNotice: false })).toBe('no_plan');
  });

  it('sem atribuição ativa continua "sem treino" mesmo com pendência aberta (new_student)', () => {
    expect(computeStudentStatus({ hasActiveAssignment: false, hasOpenNotice: true })).toBe('no_plan');
  });

  it('com atribuição ativa e pendência aberta é "a revisar", como Rafael e Diego no seed', () => {
    expect(computeStudentStatus({ hasActiveAssignment: true, hasOpenNotice: true })).toBe(
      'needs_review',
    );
  });

  it('com atribuição ativa e sem pendência é "ativo", como Victor no seed', () => {
    expect(computeStudentStatus({ hasActiveAssignment: true, hasOpenNotice: false })).toBe('active');
  });
});
