import type { BodyRegion, WorkoutPlan } from '@gym/core';
import { isAdaptedExercise } from '@gym/core';
import { BODY_REGION_LABELS } from '../../gym/students/labels';
import { Sheet } from '../../../ui/index.ts';

interface PlanDetailSheetProps {
  plan: WorkoutPlan | null;
  injuries: readonly BodyRegion[];
  onClose: () => void;
}

/** Visualização somente leitura do plano do dia — a execução (cronômetro, séries) é F1-E10. */
export function PlanDetailSheet({ plan, injuries, onClose }: PlanDetailSheetProps) {
  if (!plan) return null;

  return (
    <Sheet open title={`${plan.letter} · ${plan.name}`} onClose={onClose}>
      <p className="text-subtle mb-4 text-sm">
        {plan.focus} · {plan.weekday} · {plan.duration}
      </p>
      <ul className="flex flex-col gap-3">
        {plan.exercises.map((exercise) => {
          const adapted = isAdaptedExercise(exercise.sensitiveRegions, injuries);
          return (
            <li key={exercise.id} className="border-border border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-fg text-sm font-semibold">{exercise.name}</p>
                {adapted ? (
                  <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-semibold">
                    Adaptado
                  </span>
                ) : null}
              </div>
              <p className="text-subtle text-xs">
                {exercise.sets} × {exercise.reps}
              </p>
              {adapted ? (
                <p className="text-faint mt-1 text-xs">
                  Atenção: {exercise.sensitiveRegions
                    .filter((region) => injuries.includes(region))
                    .map((region) => BODY_REGION_LABELS[region])
                    .join(', ')}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
