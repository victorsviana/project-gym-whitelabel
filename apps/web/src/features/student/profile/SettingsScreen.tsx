import type { NotificationPreferences, StudentPreferences, StudentProfile } from '@gym/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentRepository } from '../../../storage';
import { Card, SegmentedControl, Toggle } from '../../../ui/index.ts';
import { applyThemeVars } from '../../auth/apply-gym-theme';
import { useSessionAccount } from '../../auth/use-session-account';
import { GOAL_LABELS } from '../../gym/students/labels';
import { loadStudentPreferences } from './load-profile';

const APP_VERSION = '1.0.0';

type ThemeChoice = 'gym' | 'dark' | 'light';

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'gym', label: 'Da academia' },
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' },
];

const NOTIFICATION_ROWS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'workoutReminder', label: 'Lembrete de treino' },
  { key: 'mealReminder', label: 'Lembrete de refeição' },
  { key: 'reassessmentReminder', label: 'Reavaliação mensal' },
];

export function SettingsScreen() {
  const { user, gym, loading } = useSessionAccount();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);
  const [preferences, setPreferences] = useState<StudentPreferences | undefined>(undefined);

  useEffect(() => {
    if (!user || !gym) return;
    let cancelled = false;
    Promise.all([
      studentRepository.findProfile(gym.id, user.id),
      loadStudentPreferences(gym.id, user.id),
    ]).then(([foundProfile, foundPreferences]) => {
      if (cancelled) return;
      setProfile(foundProfile);
      setPreferences(foundPreferences);
    });
    return () => {
      cancelled = true;
    };
  }, [user, gym]);

  if (loading || profile === undefined || !preferences) return null;
  if (!user || !gym) return null;

  const themeChoice: ThemeChoice = preferences.themeMode ?? 'gym';

  const handleThemeChange = async (choice: ThemeChoice) => {
    const themeMode = choice === 'gym' ? null : choice;
    applyThemeVars(themeMode ? { ...gym.theme, mode: themeMode } : gym.theme);
    const next: StudentPreferences = { ...preferences, themeMode, updatedAt: new Date().toISOString() };
    setPreferences(next);
    await studentRepository.savePreferences(next);
  };

  const handleNotificationToggle = async (key: keyof NotificationPreferences) => {
    const next: StudentPreferences = {
      ...preferences,
      notifications: { ...preferences.notifications, [key]: !preferences.notifications[key] },
      updatedAt: new Date().toISOString(),
    };
    setPreferences(next);
    await studentRepository.savePreferences(next);
  };

  const dataRows = profile
    ? [
        { label: 'Objetivo', value: GOAL_LABELS[profile.goal] },
        { label: 'Peso', value: `${profile.weight} kg` },
        { label: 'Altura', value: `${profile.height} cm` },
        { label: 'Frequência', value: `${profile.daysPerWeek}x / semana` },
      ]
    : [];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10 pb-16">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/aluno/perfil')}
          className="bg-surface-2 focus-visible:ring-brand/50 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-icon focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Voltar"
        >
          ←
        </button>
        <h1 className="font-display text-2xl font-extrabold tracking-wide uppercase">Ajustes</h1>
      </header>

      <div>
        <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Aparência</p>
        <Card>
          <p className="mb-2 text-sm font-semibold">Tema</p>
          <SegmentedControl aria-label="Tema" options={THEME_OPTIONS} value={themeChoice} onChange={(value) => void handleThemeChange(value)} />
        </Card>
      </div>

      {profile ? (
        <div>
          <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Meus dados</p>
          <Card className="flex flex-col gap-3">
            {dataRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-subtle text-sm">{row.label}</span>
                <span className="font-display text-base font-bold">{row.value}</span>
              </div>
            ))}
          </Card>
        </div>
      ) : null}

      <div>
        <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Notificações</p>
        <div className="flex flex-col gap-2">
          {NOTIFICATION_ROWS.map((row) => (
            <Card key={row.key} className="flex flex-row items-center justify-between">
              <span className="text-sm">{row.label}</span>
              <Toggle
                label={row.label}
                checked={preferences.notifications[row.key]}
                onChange={() => void handleNotificationToggle(row.key)}
              />
            </Card>
          ))}
        </div>
      </div>

      <Card highlight className="bg-brand/10 border-brand/20">
        <p className="font-display text-base font-bold uppercase">Plano da {gym.name}</p>
        <p className="text-subtle mt-1 text-sm">
          Seu acesso ao app é um benefício da sua matrícula. Sem cobrança extra pra você.
        </p>
      </Card>

      <p className="text-faint text-center text-xs">
        {gym.name} · Whitelabel v{APP_VERSION}
      </p>
    </div>
  );
}
