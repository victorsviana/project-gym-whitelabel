import type { SetLog } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createExecutionRepository } from './execution-repository';

beforeEach(() => {
  localStorage.clear();
});

function buildSetLog(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: `set-${Math.random()}`,
    gymId: 'gavioes',
    studentId: 's1',
    planId: 'p1',
    exerciseId: 'e1',
    setIndex: 0,
    date: '2026-08-01',
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ExecutionRepository — countSetLogs', () => {
  it('conta todas as séries do aluno, de qualquer plano ou data', async () => {
    const repo = createExecutionRepository();
    await repo.markSetLog(buildSetLog({ id: 'a', planId: 'p1', date: '2026-08-01' }));
    await repo.markSetLog(buildSetLog({ id: 'b', planId: 'p2', date: '2026-07-15' }));

    expect(await repo.countSetLogs('gavioes', 's1')).toBe(2);
  });

  it('isola por academia e por aluno', async () => {
    const repo = createExecutionRepository();
    await repo.markSetLog(buildSetLog({ id: 'a', gymId: 'gavioes', studentId: 's1' }));
    await repo.markSetLog(buildSetLog({ id: 'b', gymId: 'bluefit', studentId: 's1' }));
    await repo.markSetLog(buildSetLog({ id: 'c', gymId: 'gavioes', studentId: 's2' }));

    expect(await repo.countSetLogs('gavioes', 's1')).toBe(1);
  });

  it('desmarcar uma série reduz a contagem', async () => {
    const repo = createExecutionRepository();
    await repo.markSetLog(buildSetLog({ id: 'a' }));
    await repo.markSetLog(buildSetLog({ id: 'b' }));
    await repo.removeSetLog('gavioes', 'a');

    expect(await repo.countSetLogs('gavioes', 's1')).toBe(1);
  });
});
