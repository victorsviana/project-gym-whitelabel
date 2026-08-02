import type { StudentProfile } from '@gym/core';
import { toIsoDate, todayIsoDate } from '@gym/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentRepository } from '../../../storage';
import { Button, Card, EmptyState, LetterBadge, ProgressBar } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { BottomNav } from '../BottomNav';
import { formatShortDate } from '../../gym/students/format-date';
import type { WorkoutList } from './load-workout-list';
import { loadWorkoutList } from './load-workout-list';

export function WorkoutListScreen() {
  const { user, gym, loading: loadingAccount } = useSessionAccount();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);
  const [list, setList] = useState<WorkoutList | undefined>(undefined);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

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
    loadWorkoutList(gym.id, user.id, profile.injuries, todayIsoDate())
      .then((data) => {
        if (cancelled) return;
        setError(false);
        setList(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, gym, profile, reloadToken]);

  if (loadingAccount || profile === undefined) return null;
  if (!user || !gym || !profile) return null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10 pb-28">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-wide uppercase">Treino</h1>
      </header>

      {error ? (
        <EmptyState
          title="Não deu para carregar os treinos"
          description="Tente novamente em alguns instantes."
          action={
            <Button size="sm" onClick={() => setReloadToken((token) => token + 1)}>
              Tentar de novo
            </Button>
          }
        />
      ) : list === undefined ? (
        <div className="flex flex-col gap-3" aria-label="Carregando treinos">
          {[0, 1].map((key) => (
            <div key={key} className="bg-surface-2 h-28 animate-pulse rounded-card" />
          ))}
        </div>
      ) : list.rows.length === 0 ? (
        <EmptyState title="Nenhum plano atribuído" description="Seu professor ainda não montou seu treino." />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {list.rows.map((row) => (
              <li key={row.plan.id}>
                <Card elevated className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/aluno/treino/${row.plan.id}`)}
                    className="focus-visible:ring-brand/50 flex flex-col gap-3 text-left focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <LetterBadge letter={row.plan.letter} />
                        <p className="font-display text-lg font-bold uppercase">{row.plan.name}</p>
                      </div>
                      <div className="flex gap-1">
                        {row.adapted ? (
                          <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-semibold">
                            Adaptado
                          </span>
                        ) : null}
                        {row.complete ? (
                          <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-xs font-semibold">
                            Concluído
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-subtle text-sm">
                      {row.plan.weekday} · {row.plan.focus} · {row.plan.duration}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={row.progress} max={1} color={row.complete ? 'success' : 'brand'} />
                      </div>
                      <span className="text-faint text-xs font-semibold tabular-nums">
                        {row.completedSets}/{row.totalSets}
                      </span>
                    </div>
                  </button>
                </Card>
              </li>
            ))}
          </ul>
          {list.footer ? (
            <p className="text-faint text-center text-xs">
              Montado por {list.footer.trainerName} · {gym.name}, atualizado em{' '}
              {formatShortDate(toIsoDate(new Date(list.footer.updatedAt)))}
            </p>
          ) : null}
        </>
      )}

      <BottomNav />
    </div>
  );
}
