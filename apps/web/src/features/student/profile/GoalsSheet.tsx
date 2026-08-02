import type { DailyGoal } from '@gym/core';
import {
  GOAL_CARBS_MAX,
  GOAL_CARBS_MIN,
  GOAL_CARBS_STEP,
  GOAL_KCAL_MAX,
  GOAL_KCAL_MIN,
  GOAL_KCAL_STEP,
  GOAL_PROTEIN_MAX,
  GOAL_PROTEIN_MIN,
  GOAL_PROTEIN_STEP,
  GOAL_WATER_MAX_ML,
  GOAL_WATER_MIN_ML,
  GOAL_WATER_STEP_ML,
} from '@gym/core';
import { useState } from 'react';
import { studentRepository } from '../../../storage';
import { Sheet, Stepper } from '../../../ui/index.ts';
import { formatKcal, formatWaterLiters } from '../onboarding/format';

interface GoalsSheetProps {
  open: boolean;
  goal: DailyGoal;
  onClose: () => void;
  onChange: (goal: DailyGoal) => void;
}

/** Ajuste manual de metas (UI-SPEC.md#metas-sheet) — cada +/- já persiste na hora, como o "+ copo" da Home. */
export function GoalsSheet({ open, goal, onClose, onChange }: GoalsSheetProps) {
  const [saving, setSaving] = useState(false);

  const save = async (patch: Partial<Pick<DailyGoal, 'kcal' | 'protein' | 'carbs' | 'water'>>) => {
    const next: DailyGoal = { ...goal, ...patch, source: 'manual', updatedAt: new Date().toISOString() };
    setSaving(true);
    try {
      await studentRepository.saveGoal(next);
      onChange(next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Ajustar metas">
      <div className="flex flex-col gap-5">
        <p className="text-subtle -mt-2 text-sm">Calculado da sua avaliação — ajuste se quiser.</p>

        <div className="flex flex-col gap-2">
          <p className="text-subtle text-xs font-semibold tracking-widest uppercase">Calorias</p>
          <Stepper
            value={goal.kcal}
            step={GOAL_KCAL_STEP}
            min={GOAL_KCAL_MIN}
            max={GOAL_KCAL_MAX}
            onChange={(value) => void save({ kcal: value })}
            formatValue={formatKcal}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-subtle text-xs font-semibold tracking-widest uppercase">Proteína</p>
          <Stepper
            value={goal.protein}
            step={GOAL_PROTEIN_STEP}
            min={GOAL_PROTEIN_MIN}
            max={GOAL_PROTEIN_MAX}
            onChange={(value) => void save({ protein: value })}
            unit="g"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-subtle text-xs font-semibold tracking-widest uppercase">Carboidrato</p>
          <Stepper
            value={goal.carbs}
            step={GOAL_CARBS_STEP}
            min={GOAL_CARBS_MIN}
            max={GOAL_CARBS_MAX}
            onChange={(value) => void save({ carbs: value })}
            unit="g"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-subtle text-xs font-semibold tracking-widest uppercase">Água</p>
          <Stepper
            value={goal.water}
            step={GOAL_WATER_STEP_ML}
            min={GOAL_WATER_MIN_ML}
            max={GOAL_WATER_MAX_ML}
            onChange={(value) => void save({ water: value })}
            formatValue={formatWaterLiters}
          />
        </div>

        {saving ? <p className="text-faint text-center text-xs">Salvando…</p> : null}
      </div>
    </Sheet>
  );
}
