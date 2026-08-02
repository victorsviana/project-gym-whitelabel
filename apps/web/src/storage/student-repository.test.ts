import type { StudentPreferences } from '@gym/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createStudentRepository } from './student-repository';

beforeEach(() => {
  localStorage.clear();
});

function buildPreferences(overrides: Partial<StudentPreferences> = {}): StudentPreferences {
  return {
    gymId: 'gavioes',
    studentId: 's1',
    themeMode: null,
    notifications: { workoutReminder: true, mealReminder: true, reassessmentReminder: false },
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('StudentRepository — preferências', () => {
  it('sem registro salvo, retorna null', async () => {
    const repo = createStudentRepository();
    expect(await repo.findPreferences('gavioes', 's1')).toBeNull();
  });

  it('savePreferences é upsert por studentId + gymId', async () => {
    const repo = createStudentRepository();
    await repo.savePreferences(buildPreferences({ themeMode: 'light' }));
    await repo.savePreferences(buildPreferences({ themeMode: 'dark' }));

    const found = await repo.findPreferences('gavioes', 's1');
    expect(found?.themeMode).toBe('dark');
  });

  it('isola por academia — mesmo studentId em outra academia não vaza', async () => {
    const repo = createStudentRepository();
    await repo.savePreferences(buildPreferences({ gymId: 'gavioes', themeMode: 'dark' }));
    await repo.savePreferences(buildPreferences({ gymId: 'bluefit', themeMode: 'light' }));

    expect((await repo.findPreferences('gavioes', 's1'))?.themeMode).toBe('dark');
    expect((await repo.findPreferences('bluefit', 's1'))?.themeMode).toBe('light');
  });
});
