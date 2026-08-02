import type { BodyRegion, PlanExercise } from '@gym/core';
import { createId } from '@gym/core';
import { useState } from 'react';
import { Button, Card, Chip, TextField } from '../../../ui/index.ts';
import { BODY_REGION_LABELS } from '../students/labels';
import { reorderExercises, withExercise, withoutExercise } from './exercise-utils';

const BODY_REGIONS = Object.keys(BODY_REGION_LABELS) as BodyRegion[];

interface ExerciseFormState {
  id: string | null;
  name: string;
  sets: number;
  reps: string;
  sensitiveRegions: BodyRegion[];
}

const BLANK_FORM: ExerciseFormState = { id: null, name: '', sets: 3, reps: '', sensitiveRegions: [] };

interface ExerciseEditorProps {
  exercises: PlanExercise[];
  onChange: (exercises: PlanExercise[]) => void;
}

export function ExerciseEditor({ exercises, onChange }: ExerciseEditorProps) {
  const [form, setForm] = useState<ExerciseFormState | null>(null);

  const startEdit = (exercise: PlanExercise) =>
    setForm({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      sensitiveRegions: exercise.sensitiveRegions,
    });

  const toggleRegion = (region: BodyRegion) => {
    if (!form) return;
    setForm({
      ...form,
      sensitiveRegions: form.sensitiveRegions.includes(region)
        ? form.sensitiveRegions.filter((existing) => existing !== region)
        : [...form.sensitiveRegions, region],
    });
  };

  const commitExercise = () => {
    if (!form || !form.name.trim() || !form.reps.trim()) return;
    const exercise: PlanExercise = {
      id: form.id ?? createId(),
      name: form.name.trim(),
      sets: form.sets,
      reps: form.reps.trim(),
      order: 0,
      sensitiveRegions: form.sensitiveRegions,
    };
    onChange(withExercise(exercises, exercise));
    setForm(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-subtle text-xs font-semibold tracking-widest uppercase">Exercícios</p>
        {!form ? (
          <Button type="button" variant="secondary" size="sm" onClick={() => setForm(BLANK_FORM)}>
            Adicionar exercício
          </Button>
        ) : null}
      </div>

      {exercises.length === 0 && !form ? (
        <p className="text-subtle text-sm">Nenhum exercício ainda — adicione o primeiro.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {exercises.map((exercise, index) => (
            <li key={exercise.id}>
              <Card className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{exercise.name}</p>
                  <p className="text-subtle text-sm">
                    {exercise.sets}x {exercise.reps}
                    {exercise.sensitiveRegions.length > 0
                      ? ` · ${exercise.sensitiveRegions.map((region) => BODY_REGION_LABELS[region]).join(', ')}`
                      : ''}
                  </p>
                </div>
                <div className="text-muted flex shrink-0 items-center gap-1 text-lg">
                  <button
                    type="button"
                    aria-label={`Mover ${exercise.name} para cima`}
                    disabled={index === 0}
                    onClick={() => onChange(reorderExercises(exercises, index, -1))}
                    className="focus-visible:ring-brand/50 flex size-8 cursor-pointer items-center justify-center rounded-icon leading-none focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover ${exercise.name} para baixo`}
                    disabled={index === exercises.length - 1}
                    onClick={() => onChange(reorderExercises(exercises, index, 1))}
                    className="focus-visible:ring-brand/50 flex size-8 cursor-pointer items-center justify-center rounded-icon leading-none focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Editar ${exercise.name}`}
                    onClick={() => startEdit(exercise)}
                    className="focus-visible:ring-brand/50 flex size-8 cursor-pointer items-center justify-center rounded-icon text-base leading-none focus-visible:ring-2 focus-visible:outline-none"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${exercise.name}`}
                    onClick={() => onChange(withoutExercise(exercises, exercise.id))}
                    className="text-protein focus-visible:ring-brand/50 flex size-8 cursor-pointer items-center justify-center rounded-icon leading-none focus-visible:ring-2 focus-visible:outline-none"
                  >
                    ×
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {form ? (
        <Card elevated>
          <div className="flex flex-col gap-3">
            <TextField
              label="Nome do exercício"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Séries"
                type="number"
                min={1}
                value={form.sets}
                onChange={(event) => setForm({ ...form, sets: Number(event.target.value) })}
              />
              <TextField
                label="Repetições"
                placeholder="8–10 ou 40s"
                value={form.reps}
                onChange={(event) => setForm({ ...form, reps: event.target.value })}
              />
            </div>
            <div>
              <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
                Regiões sensíveis
              </p>
              <div className="flex flex-wrap gap-2">
                {BODY_REGIONS.map((region) => (
                  <Chip
                    key={region}
                    selected={form.sensitiveRegions.includes(region)}
                    onClick={() => toggleRegion(region)}
                  >
                    {BODY_REGION_LABELS[region]}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => setForm(null)}>
                Cancelar
              </Button>
              <Button type="button" fullWidth onClick={commitExercise}>
                {form.id ? 'Salvar exercício' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
