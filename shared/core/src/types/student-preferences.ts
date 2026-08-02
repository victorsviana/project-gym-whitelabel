export interface NotificationPreferences {
  workoutReminder: boolean;
  mealReminder: boolean;
  reassessmentReminder: boolean;
}

export interface StudentPreferences {
  studentId: string;
  gymId: string;
  /** null = segue o tema padrão da academia (WHITELABEL.md#temas-escuro-e-claro). */
  themeMode: 'dark' | 'light' | null;
  notifications: NotificationPreferences;
  updatedAt: string;
}
