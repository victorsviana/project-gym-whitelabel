import type { Gym } from '@gym/core';
import { computeDailyGoal, kcalAdjustmentPct } from '@gym/core';
import { Button, Card } from '../../../ui/index.ts';
import { BODY_REGION_LABELS } from '../../gym/students/labels';
import { GOAL_FOCUS_LABELS } from './copy';
import { formatKcal, formatKcalAdjustment, formatWaterLiters } from './format';
import type { OnboardingAnswers } from './types';

interface GoalsReadyScreenProps {
  answers: OnboardingAnswers;
  gym: Gym;
  onEnter: () => void;
}

/** Tela de metas prontas — kcal, macros, TMB/TDEE/ajuste, alerta de treino adaptado (UI-SPEC.md). */
export function GoalsReadyScreen({ answers, gym, onEnter }: GoalsReadyScreenProps) {
  const goal = computeDailyGoal(answers);
  const adjustmentPct = kcalAdjustmentPct(answers.goal);
  const firstInjury = answers.injuries[0];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <div className="flex-1 px-5 py-10">
        <div className="border-brand/35 bg-brand/12 inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
          <span className="bg-brand size-1.5 rounded-full" />
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            Perfil pronto
          </span>
        </div>

        <h1 className="font-display mt-3 text-4xl leading-none font-extrabold uppercase">
          Suas metas <span className="text-brand">estão prontas</span>
        </h1>
        <p className="text-subtle mt-3 text-sm leading-relaxed">
          Calculamos sua dieta com foco em <span className="text-fg font-semibold">{GOAL_FOCUS_LABELS[answers.goal]}</span>.
          Seu treino personalizado será montado pela equipe da{' '}
          <span className="text-fg font-semibold">{gym.name}</span> e aparece aqui no app.
        </p>

        {firstInjury ? (
          <div className="border-protein/28 bg-protein/8 rounded-card mt-4 border p-4">
            <p className="font-display text-protein text-base font-bold uppercase">
              Treino adaptado pro seu {BODY_REGION_LABELS[firstInjury].toLowerCase()}
            </p>
            <p className="text-fg-muted mt-1 text-sm leading-relaxed">
              Os exercícios que sobrecarregam essa região aparecem com a etiqueta "Adaptado".
            </p>
          </div>
        ) : null}

        <Card elevated className="mt-4">
          <p className="text-subtle text-xs font-semibold tracking-widest uppercase">Sua meta diária</p>
          <p className="font-display mt-1 text-4xl font-extrabold">{formatKcal(goal.kcal)}</p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-protein/10 rounded-field py-2 text-center">
              <p className="font-display text-protein text-xl font-extrabold">{goal.protein}g</p>
              <p className="text-subtle text-[10px] font-semibold tracking-wide uppercase">Proteína</p>
            </div>
            <div className="bg-carbs/10 rounded-field py-2 text-center">
              <p className="font-display text-carbs text-xl font-extrabold">{goal.carbs}g</p>
              <p className="text-subtle text-[10px] font-semibold tracking-wide uppercase">Carbo</p>
            </div>
            <div className="bg-fat/10 rounded-field py-2 text-center">
              <p className="font-display text-fat text-xl font-extrabold">{goal.fat}g</p>
              <p className="text-subtle text-[10px] font-semibold tracking-wide uppercase">Gordura</p>
            </div>
          </div>

          <div className="border-border mt-4 flex flex-col gap-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-subtle text-sm">Metabolismo basal (TMB)</span>
              <span className="font-display text-sm font-bold">{goal.bmr} kcal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-subtle text-sm">Gasto com treino (TDEE)</span>
              <span className="font-display text-sm font-bold">{goal.tdee} kcal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-subtle text-sm">Ajuste do objetivo</span>
              <span className="font-display text-brand text-sm font-bold">
                {formatKcalAdjustment(adjustmentPct)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-subtle text-sm">Meta de água</span>
              <span className="font-display text-water text-sm font-bold">
                {formatWaterLiters(goal.water)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="mt-3">
          <p className="font-display text-lg font-bold uppercase">Treino da {gym.name}</p>
          <p className="text-fg-muted mt-1 text-sm">
            {answers.daysPerWeek} treinos por semana, montados pela equipe da {gym.name}.
          </p>
        </Card>
      </div>

      <div className="px-5 pb-10">
        <Button fullWidth onClick={onEnter}>
          Entrar no app
        </Button>
      </div>
    </div>
  );
}
