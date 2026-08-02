import type { IsoDate, StudentProfile } from '@gym/core';
import {
  addWaterCup,
  computeFilledCups,
  computeProgress,
  computeRemainingKcal,
  computeTotalCups,
  removeWaterCup,
  todayIsoDate,
} from '@gym/core';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { nutritionRepository, studentRepository } from '../../storage';
import { useSessionAccount } from '../auth/use-session-account';
import { useSessionStore } from '../auth/use-session';
import { Button, Card, EmptyState, ProgressBar, Ring } from '../../ui/index.ts';
import { ConsistencyCalendar } from './home/ConsistencyCalendar';
import { DayDetailSheet } from './home/DayDetailSheet';
import { formatCalendarMonth, formatGreetDate } from './home/format';
import type { DayDetail, GoalProgress, MonthActivity, TodayWorkout } from './home/load-home';
import { loadDayDetail, loadGoalProgress, loadMonthActivity, loadTodayWorkout } from './home/load-home';
import { PlanDetailSheet } from './home/PlanDetailSheet';

export function StudentHome() {
  const { user, gym, loading } = useSessionAccount();
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);

  const [today] = useState<IsoDate>(() => todayIsoDate());
  const [workout, setWorkout] = useState<TodayWorkout | undefined>(undefined);
  const [goalProgress, setGoalProgress] = useState<GoalProgress | undefined>(undefined);
  const [monthActivity, setMonthActivity] = useState<MonthActivity | undefined>(undefined);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<IsoDate | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [savingWater, setSavingWater] = useState(false);

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

    Promise.all([
      loadTodayWorkout(gym.id, user.id, profile.injuries, today),
      loadGoalProgress(gym.id, user.id, today),
      loadMonthActivity(gym.id, user.id, today),
    ]).then(([todayWorkout, goals, activity]) => {
      if (cancelled) return;
      setWorkout(todayWorkout);
      setGoalProgress(goals);
      setMonthActivity(activity);
    });

    return () => {
      cancelled = true;
    };
  }, [user, gym, profile, today]);

  if (loading || profile === undefined) return null;
  // onboardedAt null (nenhum StudentProfile ainda) é o sinal de onboarding pendente (F1-E06, F1-E08).
  if (!profile) return <Navigate to="/aluno/onboarding" replace />;
  if (!user || !gym) return null;

  const handleSelectDay = (date: IsoDate) => {
    setSelectedDay(date);
    setDayDetail(null);
    loadDayDetail(gym.id, user.id, date).then(setDayDetail);
  };

  const handleWaterChange = async (nextAmount: number) => {
    if (!goalProgress) return;
    setSavingWater(true);
    try {
      await nutritionRepository.saveWaterLog({ gymId: gym.id, studentId: user.id, date: today, amount: nextAmount });
      setGoalProgress({ ...goalProgress, water: { gymId: gym.id, studentId: user.id, date: today, amount: nextAmount } });
    } finally {
      setSavingWater(false);
    }
  };

  const goal = goalProgress?.goal ?? null;
  const consumed = goalProgress?.consumed ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const waterAmount = goalProgress?.water?.amount ?? 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-brand font-display text-sm font-bold tracking-widest uppercase">
            {gym.name}
          </p>
          <h1 className="font-display text-2xl font-extrabold tracking-wide uppercase">
            Olá, {user.name.split(' ')[0]}
          </h1>
          <p className="text-subtle text-sm">{formatGreetDate(today)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled title="Ajustes chega no F1-E12">
            Ajustes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Sair
          </Button>
        </div>
      </header>

      <Card elevated>
        <p className="font-display mb-3 text-sm font-bold tracking-wide uppercase">Treino de hoje</p>
        {workout === undefined ? (
          <div className="bg-surface-2 h-20 animate-pulse rounded-card" />
        ) : !workout.plan ? (
          <EmptyState
            title="Sem treino hoje"
            description="Seu professor ainda não montou seu treino."
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-lg font-bold uppercase">
                {workout.plan.letter} · {workout.plan.name}
              </p>
              {workout.isAdapted ? (
                <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-semibold">
                  Adaptado
                </span>
              ) : null}
            </div>
            <p className="text-subtle text-sm">
              {workout.plan.focus} · {workout.plan.duration}
            </p>
            {workout.trainerName ? (
              <p className="text-faint text-xs">Professor: {workout.trainerName}</p>
            ) : null}
            <div className="mt-1 flex gap-2">
              <Button size="sm" fullWidth disabled title="Iniciar treino chega no F1-E10">
                Iniciar treino
              </Button>
              <Button variant="secondary" size="sm" fullWidth onClick={() => setPlanSheetOpen(true)}>
                Ver plano
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card elevated>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm font-bold tracking-wide uppercase">Constância</p>
          <span className="text-streak text-xs font-bold">
            🔥 {monthActivity?.streak ?? 0} dia{(monthActivity?.streak ?? 0) === 1 ? '' : 's'}
          </span>
        </div>
        <p className="text-subtle mb-2 text-xs">{formatCalendarMonth(today)}</p>
        {monthActivity === undefined ? (
          <div className="bg-surface-2 h-48 animate-pulse rounded-card" />
        ) : (
          <>
            <ConsistencyCalendar
              today={today}
              activeDates={monthActivity.activeDates}
              onSelectDay={handleSelectDay}
            />
            <p className="text-subtle mt-3 text-xs">
              {monthActivity.activeCount} dia{monthActivity.activeCount === 1 ? '' : 's'} ativo
              {monthActivity.activeCount === 1 ? '' : 's'} este mês
            </p>
          </>
        )}
      </Card>

      <Card elevated>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-sm font-bold tracking-wide uppercase">Metas de hoje</p>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled title="Ajuste manual de metas chega no F1-E12">
              Ajustar
            </Button>
            <Button variant="ghost" size="sm" disabled title="Registro de alimento chega no F1-E11">
              + Registrar
            </Button>
          </div>
        </div>
        {goalProgress === undefined ? (
          <div className="bg-surface-2 h-40 animate-pulse rounded-card" />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-center">
              <Ring value={goal ? consumed.kcal : 0} max={goal?.kcal || 1}>
                <div className="text-center">
                  <p className="font-display text-2xl font-extrabold">{consumed.kcal}</p>
                  <p className="text-subtle text-xs">de {goal?.kcal ?? '—'} kcal</p>
                </div>
              </Ring>
            </div>
            <p className="text-subtle text-center text-sm">
              {goal ? computeRemainingKcal(goal.kcal, consumed.kcal) : '—'} kcal restantes
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-subtle">Proteína</span>
                  <span className="text-faint">
                    {consumed.protein}g / {goal?.protein ?? '—'}g
                  </span>
                </div>
                <ProgressBar
                  value={goal ? computeProgress(consumed.protein, goal.protein) : 0}
                  color="protein"
                  label="Proteína"
                />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-subtle">Carboidrato</span>
                  <span className="text-faint">
                    {consumed.carbs}g / {goal?.carbs ?? '—'}g
                  </span>
                </div>
                <ProgressBar
                  value={goal ? computeProgress(consumed.carbs, goal.carbs) : 0}
                  color="carbs"
                  label="Carboidrato"
                />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-subtle">Gordura</span>
                  <span className="text-faint">
                    {consumed.fat}g / {goal?.fat ?? '—'}g
                  </span>
                </div>
                <ProgressBar
                  value={goal ? computeProgress(consumed.fat, goal.fat) : 0}
                  color="fat"
                  label="Gordura"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card elevated>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm font-bold tracking-wide uppercase">Hidratação</p>
          <p className="text-subtle text-sm">
            {(waterAmount / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}L
            {' / '}
            {((goal?.water ?? 0) / 1000).toLocaleString('pt-BR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            L
          </p>
        </div>
        {goalProgress === undefined ? (
          <div className="bg-surface-2 h-16 animate-pulse rounded-card" />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: computeTotalCups(goal?.water ?? 0) }).map((_, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className={[
                    'flex size-8 items-center justify-center rounded-icon text-xs',
                    index < computeFilledCups(waterAmount) ? 'bg-water text-brand-fg' : 'bg-surface-2 text-faint',
                  ].join(' ')}
                >
                  💧
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                disabled={savingWater || waterAmount <= 0}
                onClick={() => handleWaterChange(removeWaterCup(waterAmount))}
              >
                − copo
              </Button>
              <Button
                size="sm"
                fullWidth
                disabled={savingWater}
                onClick={() => handleWaterChange(addWaterCup(waterAmount, goal?.water ?? 0))}
              >
                + copo
              </Button>
            </div>
          </>
        )}
      </Card>

      <PlanDetailSheet
        plan={planSheetOpen ? (workout?.plan ?? null) : null}
        injuries={profile.injuries}
        onClose={() => setPlanSheetOpen(false)}
      />
      <DayDetailSheet date={selectedDay} detail={dayDetail} onClose={() => setSelectedDay(null)} />
    </div>
  );
}
