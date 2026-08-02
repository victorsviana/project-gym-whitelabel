import { describe, expect, it } from 'vitest';
import { defaultNotificationPreferences } from './student-preferences';

describe('defaultNotificationPreferences', () => {
  it('liga treino e refeição, deixa reavaliação desligada', () => {
    expect(defaultNotificationPreferences()).toEqual({
      workoutReminder: true,
      mealReminder: true,
      reassessmentReminder: false,
    });
  });
});
