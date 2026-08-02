import { Button, Card, Stepper } from '../../../ui/index.ts';
import { formatLoadDelta, formatLoadKg } from './format';
import type { ExerciseDetail } from './load-workout-detail';

interface ExerciseCardProps {
  exercise: ExerciseDetail;
  draftLoad: number;
  onDraftLoadChange: (value: number) => void;
  onToggleSet: (setIndex: number) => void;
  onSaveLoad: () => void;
  savingLoad: boolean;
}

const DELTA_COLOR_CLASS: Record<'up' | 'down' | 'flat', string> = {
  up: 'text-success',
  down: 'text-protein',
  flat: 'text-faint',
};

export function ExerciseCard({
  exercise,
  draftLoad,
  onDraftLoadChange,
  onToggleSet,
  onSaveLoad,
  savingLoad,
}: ExerciseCardProps) {
  const maxHistoryWeight = Math.max(1, ...exercise.loadHistory.map((log) => log.weight));
  const deltaTone = exercise.loadDelta > 0 ? 'up' : exercise.loadDelta < 0 ? 'down' : 'flat';

  return (
    <Card elevated className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-lg font-bold uppercase">{exercise.name}</p>
        {exercise.adapted ? (
          <span className="bg-success/10 text-success shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold">
            Adaptado
          </span>
        ) : null}
      </div>
      <p className="text-subtle -mt-2 text-xs">
        {exercise.sets} × {exercise.reps}
      </p>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: exercise.sets }).map((_, setIndex) => {
          const done = exercise.completedSets.has(setIndex);
          return (
            <button
              key={setIndex}
              type="button"
              aria-pressed={done}
              aria-label={`Série ${setIndex + 1} de ${exercise.name}, ${done ? 'concluída' : 'não concluída'}`}
              onClick={() => onToggleSet(setIndex)}
              className={[
                'font-display focus-visible:ring-brand/50 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-icon border text-base font-extrabold focus-visible:ring-2 focus-visible:outline-none',
                done ? 'bg-brand text-brand-fg border-brand' : 'border-border text-subtle bg-transparent',
              ].join(' ')}
            >
              {setIndex + 1}
            </button>
          );
        })}
      </div>

      <div className="border-border flex flex-col gap-3 border-t pt-4">
        <Stepper
          value={draftLoad}
          step={2.5}
          min={0}
          max={500}
          onChange={onDraftLoadChange}
          formatValue={formatLoadKg}
        />
        <Button size="sm" fullWidth disabled={savingLoad} onClick={onSaveLoad}>
          {savingLoad ? 'Registrando…' : 'Registrar carga'}
        </Button>

        {exercise.loadHistory.length > 0 ? (
          <div className="flex items-end justify-between gap-3">
            <div className="flex h-12 flex-1 items-end gap-1.5">
              {exercise.loadHistory.slice(-6).map((log) => (
                <span
                  key={log.id}
                  aria-hidden="true"
                  className="bg-brand w-2 rounded-sm"
                  style={{ height: `${Math.max(15, Math.round((log.weight / maxHistoryWeight) * 100))}%` }}
                />
              ))}
            </div>
            <p className={`text-xs font-bold tabular-nums ${DELTA_COLOR_CLASS[deltaTone]}`}>
              {formatLoadDelta(exercise.loadDelta)}
            </p>
          </div>
        ) : (
          <p className="text-faint text-xs">Sem histórico de carga ainda.</p>
        )}
      </div>
    </Card>
  );
}
