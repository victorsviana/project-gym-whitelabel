import type { IsoDate, StudentPreferences } from '@gym/core';
import { defaultNotificationPreferences } from '@gym/core';
import { executionRepository, studentRepository } from '../../../storage';
import { loadMonthActivity } from '../home/load-home';

export interface ProfileStats {
  streak: number;
  activeThisMonth: number;
  setsDone: number;
}

/** Sequência e dias/mês reaproveitam a mesma janela de mês atual + anterior da Home. */
export async function loadProfileStats(gymId: string, studentId: string, today: IsoDate): Promise<ProfileStats> {
  const [monthActivity, setsDone] = await Promise.all([
    loadMonthActivity(gymId, studentId, today),
    executionRepository.countSetLogs(gymId, studentId),
  ]);

  return { streak: monthActivity.streak, activeThisMonth: monthActivity.activeCount, setsDone };
}

/** Preferências salvas, ou os padrões (tema da academia, notificações padrão) para quem nunca configurou nada. */
export async function loadStudentPreferences(gymId: string, studentId: string): Promise<StudentPreferences> {
  const found = await studentRepository.findPreferences(gymId, studentId);
  return (
    found ?? {
      gymId,
      studentId,
      themeMode: null,
      notifications: defaultNotificationPreferences(),
      updatedAt: new Date(0).toISOString(),
    }
  );
}
