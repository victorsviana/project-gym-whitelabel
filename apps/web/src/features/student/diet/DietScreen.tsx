import type { Food, IsoDate } from '@gym/core';
import { computeProgress, sumMealTotals, suggestMealType, todayIsoDate } from '@gym/core';
import { useEffect, useState } from 'react';
import { Button, Card, EmptyState, ProgressBar } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { formatShortDate } from '../../gym/students/format-date';
import { BottomNav } from '../BottomNav';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../meal-labels';
import { AddMealSheet } from './AddMealSheet';
import type { DietHistoryDay, DietToday } from './load-diet';
import { loadDietHistory, loadDietToday, loadFoodBase } from './load-diet';
import { buildSearchMeal, removeMealEntry, saveMealEntry } from './save-meal';

export function DietScreen() {
  const { user, gym, loading: loadingAccount } = useSessionAccount();
  const [today] = useState<IsoDate>(() => todayIsoDate());

  const [dietToday, setDietToday] = useState<DietToday | undefined>(undefined);
  const [history, setHistory] = useState<DietHistoryDay[] | undefined>(undefined);
  const [foodBase, setFoodBase] = useState<Food[] | undefined>(undefined);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [quickAddingId, setQuickAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !gym) return;
    let cancelled = false;
    Promise.all([
      loadDietToday(gym.id, user.id, today),
      loadDietHistory(gym.id, user.id, today),
      loadFoodBase(gym.id),
    ])
      .then(([diet, historyDays, foods]) => {
        if (cancelled) return;
        setError(false);
        setDietToday(diet);
        setHistory(historyDays);
        setFoodBase(foods);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, gym, today, reloadToken]);

  if (loadingAccount || !user || !gym) return null;

  const reload = () => setReloadToken((token) => token + 1);

  const handleRemove = async (mealId: string) => {
    await removeMealEntry(gym.id, user.id, mealId, today);
    reload();
  };

  const handleQuickAdd = async (food: Food) => {
    setQuickAddingId(food.id);
    try {
      const now = new Date();
      const type = suggestMealType(now.getHours(), now.getMinutes());
      const meal = buildSearchMeal(gym.id, user.id, today, type, food, food.defaultQuantity);
      await saveMealEntry(meal);
      reload();
    } finally {
      setQuickAddingId(null);
    }
  };

  const goal = dietToday?.goal ?? null;
  const meals = dietToday?.meals ?? [];
  const groups = MEAL_TYPE_ORDER.map((type) => ({
    type,
    items: meals.filter((meal) => meal.type === type),
  })).filter((group) => group.items.length > 0);

  const loadingContent = dietToday === undefined || history === undefined || foodBase === undefined;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10 pb-28">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold tracking-wide uppercase">Dieta</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          + Registrar
        </Button>
      </header>

      {error ? (
        <EmptyState
          title="Não deu para carregar a dieta"
          description="Tente novamente em alguns instantes."
          action={
            <Button size="sm" onClick={reload}>
              Tentar de novo
            </Button>
          }
        />
      ) : loadingContent ? (
        <div className="flex flex-col gap-3" aria-label="Carregando dieta">
          {[0, 1, 2].map((key) => (
            <div key={key} className="bg-surface-2 h-24 animate-pulse rounded-card" />
          ))}
        </div>
      ) : (
        <>
          {foodBase.length > 0 ? (
            <Card elevated>
              <p className="font-display mb-3 text-sm font-bold tracking-wide uppercase">Sugestões rápidas</p>
              <div className="flex flex-wrap gap-2">
                {foodBase.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    disabled={quickAddingId === food.id}
                    onClick={() => void handleQuickAdd(food)}
                    className="border-border bg-surface-2 text-fg focus-visible:ring-brand/50 min-h-11 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {food.name} · {food.defaultQuantity}g
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          <Card elevated>
            <p className="font-display mb-3 text-sm font-bold tracking-wide uppercase">Hoje</p>
            {groups.length === 0 ? (
              <EmptyState
                title="Nenhuma refeição registrada"
                description="Toque em uma sugestão rápida ou registre um alimento."
              />
            ) : (
              <ul className="flex flex-col gap-4">
                {groups.map((group) => {
                  const totals = sumMealTotals(group.items);
                  return (
                    <li key={group.type}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-subtle text-xs font-semibold uppercase">
                          {MEAL_TYPE_LABELS[group.type]}
                        </p>
                        <p className="text-faint text-xs">{totals.kcal} kcal</p>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {group.items.map((meal) => (
                          <li key={meal.id} className="flex items-center justify-between gap-2 text-sm">
                            <span>{meal.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-subtle">{meal.kcal} kcal</span>
                              <button
                                type="button"
                                aria-label={`Remover ${meal.name}`}
                                onClick={() => void handleRemove(meal.id)}
                                className="text-faint focus-visible:ring-brand/50 cursor-pointer text-xs font-semibold uppercase focus-visible:ring-2 focus-visible:outline-none"
                              >
                                Remover
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card elevated>
            <p className="font-display mb-3 text-sm font-bold tracking-wide uppercase">Últimos 7 dias</p>
            <ul className="flex flex-col gap-3">
              {history.map((day) => (
                <li key={day.date} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{formatShortDate(day.date)}</span>
                    <span className="text-subtle text-xs">
                      {day.totals.kcal} kcal · {day.mealCount} {day.mealCount === 1 ? 'refeição' : 'refeições'}
                    </span>
                  </div>
                  <ProgressBar
                    value={goal ? computeProgress(day.totals.kcal, goal.kcal) : 0}
                    color="brand"
                    label={`Calorias de ${formatShortDate(day.date)}`}
                  />
                  <p className="text-faint text-xs">
                    P {day.totals.protein}g · C {day.totals.carbs}g · G {day.totals.fat}g
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <AddMealSheet
        open={sheetOpen}
        gymId={gym.id}
        studentId={user.id}
        date={today}
        foodBase={foodBase ?? []}
        onClose={() => setSheetOpen(false)}
        onAdded={() => {
          setSheetOpen(false);
          reload();
        }}
      />

      <BottomNav />
    </div>
  );
}
