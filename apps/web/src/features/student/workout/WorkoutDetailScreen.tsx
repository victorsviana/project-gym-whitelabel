import type { IsoDate, StudentProfile } from '@gym/core';
import { createId, todayIsoDate } from '@gym/core';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { executionRepository, studentRepository } from '../../../storage';
import { Button, Card, EmptyState, Toast } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { ExerciseCard } from './ExerciseCard';
import { formatClock } from './format';
import type { WorkoutDetail } from './load-workout-detail';
import { loadWorkoutDetail } from './load-workout-detail';
import { REST_ALERT_THRESHOLD_SEC, REST_PRESETS_SEC, useRestTimer } from './use-rest-timer';
import { useStopwatch } from './use-stopwatch';
import { syncWorkoutActivity } from './sync-activity';

function formatRestPresetLabel(seconds: number): string {
  return seconds < 120 ? `${seconds}s` : `${seconds / 60}min`;
}

export function WorkoutDetailScreen() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user, gym, loading: loadingAccount } = useSessionAccount();

  const [today] = useState<IsoDate>(() => todayIsoDate());
  const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);
  const [detail, setDetail] = useState<WorkoutDetail | null | undefined>(undefined);
  const [reloadToken, setReloadToken] = useState(0);
  const [draftLoads, setDraftLoads] = useState<Record<string, number>>({});
  const [savingLoadFor, setSavingLoadFor] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const previousPlanIdRef = useRef<string | null>(null);

  const stopwatch = useStopwatch();
  const restTimer = useRestTimer();

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
    if (!user || !gym || !profile || !planId) return;
    let cancelled = false;
    if (previousPlanIdRef.current !== planId) {
      setDetail(undefined);
      previousPlanIdRef.current = planId;
    }
    loadWorkoutDetail(gym.id, user.id, planId, profile.injuries, today).then((data) => {
      if (!cancelled) setDetail(data);
    });
    return () => {
      cancelled = true;
    };
  }, [user, gym, profile, planId, today, reloadToken]);

  if (detail) {
    const missing = detail.exercises.filter((exercise) => !(exercise.exerciseId in draftLoads));
    if (missing.length > 0) {
      const next = { ...draftLoads };
      for (const exercise of missing) next[exercise.exerciseId] = exercise.suggestedLoad;
      setDraftLoads(next);
    }
  }

  if (!planId) return <Navigate to="/aluno/treino" replace />;
  if (loadingAccount || profile === undefined || !user || !gym) return null;

  const reload = () => setReloadToken((token) => token + 1);

  const handleToggleSet = async (exerciseId: string, setIndex: number, existingId: string | undefined) => {
    if (existingId) {
      await executionRepository.removeSetLog(gym.id, existingId);
    } else {
      await executionRepository.markSetLog({
        id: createId(),
        gymId: gym.id,
        studentId: user.id,
        planId,
        exerciseId,
        setIndex,
        date: today,
        completedAt: new Date().toISOString(),
      });
    }
    await syncWorkoutActivity(gym.id, user.id, planId, today);
    reload();
  };

  const handleSaveLoad = async (exerciseId: string) => {
    setSavingLoadFor(exerciseId);
    try {
      await executionRepository.saveLoadLog({
        id: createId(),
        gymId: gym.id,
        studentId: user.id,
        planId,
        exerciseId,
        date: today,
        weight: draftLoads[exerciseId],
        updatedAt: new Date().toISOString(),
      });
      reload();
      setToastMessage('Carga registrada.');
    } finally {
      setSavingLoadFor(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10">
      <header>
        <Link to="/aluno/treino" className="text-subtle text-sm font-semibold">
          ← Voltar
        </Link>
      </header>

      {detail === undefined ? (
        <div className="flex flex-col gap-4" aria-label="Carregando treino">
          <div className="bg-surface-2 h-20 animate-pulse rounded-card" />
          <div className="bg-surface-2 h-28 animate-pulse rounded-card" />
          <div className="bg-surface-2 h-40 animate-pulse rounded-card" />
        </div>
      ) : detail === null ? (
        <EmptyState
          title="Treino não encontrado"
          description="Ele pode não estar mais atribuído a você."
          action={
            <Button size="sm" onClick={() => navigate('/aluno/treino')}>
              Voltar para treino
            </Button>
          }
        />
      ) : (
        <>
          <div>
            <h1 className="font-display mt-2 text-2xl font-extrabold tracking-wide uppercase">
              {detail.plan.letter} · {detail.plan.name}
            </h1>
            <p className="text-subtle text-sm">
              {detail.plan.weekday} · {detail.plan.focus} · {detail.plan.duration}
            </p>
            {detail.trainerName ? <p className="text-faint text-xs">Professor: {detail.trainerName}</p> : null}
          </div>

          <Card elevated className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-bold tracking-wide uppercase">Sessão</p>
              <p className="font-display text-3xl font-extrabold tabular-nums">
                {formatClock(stopwatch.elapsedSec)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={stopwatch.reset} disabled={stopwatch.elapsedSec === 0}>
                Zerar
              </Button>
              <Button size="sm" onClick={stopwatch.toggle}>
                {stopwatch.running ? 'Pausar' : 'Iniciar'}
              </Button>
            </div>
          </Card>

          <Card elevated className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs font-bold tracking-wide uppercase">Descanso</p>
              <p
                className={[
                  'font-display text-2xl font-extrabold tabular-nums',
                  restTimer.running && restTimer.remainingSec <= REST_ALERT_THRESHOLD_SEC
                    ? 'text-protein'
                    : 'text-fg',
                ].join(' ')}
              >
                {restTimer.running ? formatClock(restTimer.remainingSec) : '--:--'}
              </p>
            </div>
            <div className="flex gap-2">
              {REST_PRESETS_SEC.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => restTimer.start(seconds)}
                  className={[
                    'font-display focus-visible:ring-brand/50 min-h-11 flex-1 cursor-pointer rounded-field border text-xs font-bold tracking-wide uppercase focus-visible:ring-2 focus-visible:outline-none',
                    restTimer.activePreset === seconds
                      ? 'border-brand/25 bg-brand/16 text-brand'
                      : 'border-border bg-surface-2 text-subtle',
                  ].join(' ')}
                >
                  {formatRestPresetLabel(seconds)}
                </button>
              ))}
            </div>
          </Card>

          <ul className="flex flex-col gap-4">
            {detail.exercises.map((exercise) => (
              <li key={exercise.exerciseId}>
                <ExerciseCard
                  exercise={exercise}
                  draftLoad={draftLoads[exercise.exerciseId] ?? exercise.suggestedLoad}
                  onDraftLoadChange={(value) =>
                    setDraftLoads((prev) => ({ ...prev, [exercise.exerciseId]: value }))
                  }
                  onToggleSet={(setIndex) =>
                    void handleToggleSet(exercise.exerciseId, setIndex, exercise.completedSets.get(setIndex)?.id)
                  }
                  onSaveLoad={() => void handleSaveLoad(exercise.exerciseId)}
                  savingLoad={savingLoadFor === exercise.exerciseId}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {toastMessage ? (
        <Toast message={toastMessage} variant="success" onDismiss={() => setToastMessage(null)} />
      ) : null}
    </div>
  );
}
