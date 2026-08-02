import type { NotificationPreferences } from '../types';

/** Padrão para quem ainda não configurou — treino e refeição ligados, reavaliação desligada. */
export function defaultNotificationPreferences(): NotificationPreferences {
  return { workoutReminder: true, mealReminder: true, reassessmentReminder: false };
}
