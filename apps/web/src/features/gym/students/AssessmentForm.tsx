import type { BodyRegion, Restriction, StudentProfile } from '@gym/core';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Chip, SegmentedControl, TextField } from '../../../ui/index.ts';
import { BODY_REGION_LABELS, GOAL_LABELS, LEVEL_LABELS, RESTRICTION_LABELS } from './labels';
import type { AssessmentInput } from './save-assessment';

const SEX_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
] as const;

const GOAL_OPTIONS = (Object.entries(GOAL_LABELS) as [AssessmentInput['goal'], string][]).map(
  ([value, label]) => ({ value, label }),
);

const LEVEL_OPTIONS = (Object.entries(LEVEL_LABELS) as [AssessmentInput['level'], string][]).map(
  ([value, label]) => ({ value, label }),
);

const BODY_REGIONS = Object.keys(BODY_REGION_LABELS) as BodyRegion[];
const RESTRICTIONS = Object.keys(RESTRICTION_LABELS) as Restriction[];

function defaultsFrom(profile: StudentProfile | null): AssessmentInput {
  if (profile) {
    const { sex, age, weight, height, goal, level, daysPerWeek, injuries, restrictions } = profile;
    return { sex, age, weight, height, goal, level, daysPerWeek, injuries, restrictions };
  }
  return {
    sex: 'male',
    age: 30,
    weight: 70,
    height: 170,
    goal: 'muscle',
    level: 'beginner',
    daysPerWeek: 3,
    injuries: [],
    restrictions: [],
  };
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

interface AssessmentFormProps {
  profile: StudentProfile | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (input: AssessmentInput) => void;
}

export function AssessmentForm({ profile, submitting, onCancel, onSubmit }: AssessmentFormProps) {
  const [input, setInput] = useState<AssessmentInput>(() => defaultsFrom(profile));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(input);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Sexo</p>
        <SegmentedControl
          aria-label="Sexo"
          options={SEX_OPTIONS}
          value={input.sex}
          onChange={(sex) => setInput({ ...input, sex })}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TextField
          label="Idade"
          type="number"
          min={1}
          value={input.age}
          onChange={(event) => setInput({ ...input, age: Number(event.target.value) })}
        />
        <TextField
          label="Peso (kg)"
          type="number"
          min={1}
          value={input.weight}
          onChange={(event) => setInput({ ...input, weight: Number(event.target.value) })}
        />
        <TextField
          label="Altura (cm)"
          type="number"
          min={1}
          value={input.height}
          onChange={(event) => setInput({ ...input, height: Number(event.target.value) })}
        />
      </div>

      <div>
        <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Objetivo</p>
        <SegmentedControl
          aria-label="Objetivo"
          options={GOAL_OPTIONS}
          value={input.goal}
          onChange={(goal) => setInput({ ...input, goal })}
        />
      </div>

      <div>
        <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Nível</p>
        <SegmentedControl
          aria-label="Nível"
          options={LEVEL_OPTIONS}
          value={input.level}
          onChange={(level) => setInput({ ...input, level })}
        />
      </div>

      <TextField
        label="Dias de treino por semana"
        type="number"
        min={1}
        max={7}
        value={input.daysPerWeek}
        onChange={(event) => setInput({ ...input, daysPerWeek: Number(event.target.value) })}
      />

      <div>
        <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Lesões</p>
        <div className="flex flex-wrap gap-2">
          {BODY_REGIONS.map((region) => (
            <Chip
              key={region}
              selected={input.injuries.includes(region)}
              onClick={() => setInput({ ...input, injuries: toggle(input.injuries, region) })}
            >
              {BODY_REGION_LABELS[region]}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
          Restrições alimentares
        </p>
        <div className="flex flex-wrap gap-2">
          {RESTRICTIONS.map((restriction) => (
            <Chip
              key={restriction}
              selected={input.restrictions.includes(restriction)}
              onClick={() =>
                setInput({ ...input, restrictions: toggle(input.restrictions, restriction) })
              }
            >
              {RESTRICTION_LABELS[restriction]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Salvando…' : 'Salvar avaliação'}
        </Button>
      </div>
    </form>
  );
}
