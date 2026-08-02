import type { DailyGoal, StudentProfile } from '@gym/core';
import { todayIsoDate } from '@gym/core';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { studentRepository } from '../../../storage';
import { Button, Card } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { useSessionStore } from '../../auth/use-session';
import { BottomNav } from '../BottomNav';
import { GoalsSheet } from './GoalsSheet';
import type { ProfileStats } from './load-profile';
import { loadProfileStats } from './load-profile';

function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** Ícone de linha das duas ações do Perfil — mesmo padrão de `profileRows` de `prototype/extracted/logic.js`. */
function RowIcon({ path }: { path: string }) {
  return (
    <span className="bg-surface-2 text-subtle flex size-9 shrink-0 items-center justify-center rounded-icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    </span>
  );
}

const SETTINGS_ICON_PATH =
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z';
const GOALS_ICON_PATH = 'M4 6h16M4 12h16M4 18h10';

export function ProfileScreen() {
  const { user, gym, loading } = useSessionAccount();
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();
  const [today] = useState(() => todayIsoDate());

  const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);
  const [stats, setStats] = useState<ProfileStats | undefined>(undefined);
  const [goal, setGoal] = useState<DailyGoal | null | undefined>(undefined);
  const [goalsSheetOpen, setGoalsSheetOpen] = useState(false);

  useEffect(() => {
    if (!user || !gym) return;
    let cancelled = false;
    studentRepository.findProfile(gym.id, user.id).then((found) => {
      if (!cancelled) setProfile(found);
    });
    return () => {
      cancelled = true;
    };
  }, [user, gym]);

  useEffect(() => {
    if (!user || !gym || !profile) return;
    let cancelled = false;
    Promise.all([loadProfileStats(gym.id, user.id, today), studentRepository.findGoal(gym.id, user.id)]).then(
      ([loadedStats, loadedGoal]) => {
        if (cancelled) return;
        setStats(loadedStats);
        setGoal(loadedGoal);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [user, gym, profile, today]);

  if (loading || profile === undefined) return null;
  if (!profile) return <Navigate to="/aluno/onboarding" replace />;
  if (!user || !gym) return null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10 pb-28">
      <header className="flex items-center gap-4">
        <div className="bg-brand text-brand-fg flex size-16 shrink-0 items-center justify-center rounded-icon text-2xl font-extrabold">
          {initialsFrom(user.name)}
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-wide uppercase">
            {user.name.split(' ')[0]}
          </h1>
          <p className="text-subtle text-sm">Aluno · {gym.name}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold">{stats?.streak ?? '—'}</p>
          <p className="text-subtle mt-1 text-[10px] font-semibold tracking-widest uppercase">Sequência</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold">{stats?.activeThisMonth ?? '—'}</p>
          <p className="text-subtle mt-1 text-[10px] font-semibold tracking-widest uppercase">Dias/mês</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold">{stats?.setsDone ?? '—'}</p>
          <p className="text-subtle mt-1 text-[10px] font-semibold tracking-widest uppercase">Séries</p>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/aluno/ajustes')}
          className="bg-surface border-border focus-visible:ring-brand/50 flex cursor-pointer items-center gap-3 rounded-card border p-4 text-left focus-visible:ring-2 focus-visible:outline-none"
        >
          <RowIcon path={SETTINGS_ICON_PATH} />
          <span className="flex-1 text-sm font-semibold">Ajustes</span>
          <span aria-hidden="true" className="text-faint">
            ›
          </span>
        </button>
        <button
          type="button"
          disabled={!goal}
          onClick={() => setGoalsSheetOpen(true)}
          className="bg-surface border-border focus-visible:ring-brand/50 flex cursor-pointer items-center gap-3 rounded-card border p-4 text-left focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RowIcon path={GOALS_ICON_PATH} />
          <span className="flex-1 text-sm font-semibold">Ajustar metas de dieta</span>
          <span aria-hidden="true" className="text-faint">
            ›
          </span>
        </button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Sair da conta
        </Button>
      </div>

      {goal ? (
        <GoalsSheet
          open={goalsSheetOpen}
          goal={goal}
          onClose={() => setGoalsSheetOpen(false)}
          onChange={setGoal}
        />
      ) : null}

      <BottomNav />
    </div>
  );
}
