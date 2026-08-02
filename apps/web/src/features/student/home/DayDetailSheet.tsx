import type { IsoDate, Meal } from '@gym/core';
import { sumMealTotals } from '@gym/core';
import { Sheet } from '../../../ui/index.ts';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../meal-labels';
import { formatFullDate } from './format';
import type { DayDetail } from './load-home';

interface DayDetailSheetProps {
  date: IsoDate | null;
  detail: DayDetail | null;
  onClose: () => void;
}

/** Extrato do dia (UI-SPEC.md#extrato-do-dia) — aberto ao tocar numa célula do calendário de constância. */
export function DayDetailSheet({ date, detail, onClose }: DayDetailSheetProps) {
  if (!date) return null;

  const meals: Meal[] = detail?.meals ?? [];
  const totals = sumMealTotals(meals);
  const groups = MEAL_TYPE_ORDER.map((type) => ({
    type,
    items: meals.filter((meal) => meal.type === type),
  })).filter((group) => group.items.length > 0);

  return (
    <Sheet open title={formatFullDate(date)} onClose={onClose}>
      {!detail ? (
        <p className="text-subtle text-sm">Carregando…</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="font-display text-3xl font-extrabold">{totals.kcal} kcal</p>
            <p className="text-subtle text-sm">Total do dia</p>
          </div>

          <div>
            <p className="font-display mb-2 text-sm font-bold tracking-wide uppercase">Treino</p>
            {detail.hasWorkout ? (
              <p className="text-fg text-sm">Treino concluído nesse dia.</p>
            ) : (
              <p className="text-subtle text-sm">Nenhum treino registrado.</p>
            )}
          </div>

          <div>
            <p className="font-display mb-2 text-sm font-bold tracking-wide uppercase">Refeições</p>
            {groups.length === 0 ? (
              <p className="text-subtle text-sm">Nenhuma refeição registrada.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {groups.map((group) => (
                  <li key={group.type}>
                    <p className="text-subtle text-xs font-semibold uppercase">
                      {MEAL_TYPE_LABELS[group.type]}
                    </p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {group.items.map((meal) => (
                        <li key={meal.id} className="flex items-center justify-between text-sm">
                          <span>{meal.name}</span>
                          <span className="text-subtle">{meal.kcal} kcal</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}
