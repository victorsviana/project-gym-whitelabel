import type { BodyRegion, Restriction } from '@gym/core';
import { useState } from 'react';
import { Button, ProgressBar, Stepper } from '../../../ui/index.ts';
import { BODY_REGION_LABELS, GOAL_LABELS, LEVEL_LABELS, RESTRICTION_LABELS } from '../../gym/students/labels';
import { GOAL_SUBTITLES } from './copy';
import { OnboardingOption } from './OnboardingOption.tsx';
import {
  AGE_LIMITS,
  DAYS_PER_WEEK_LIMITS,
  HEIGHT_LIMITS,
  ONBOARDING_STEP_COUNT,
  WEIGHT_LIMITS,
  type OnboardingAnswers,
} from './types';

const SEX_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
] as const;

const GOAL_OPTIONS = (Object.entries(GOAL_LABELS) as [OnboardingAnswers['goal'], string][]).map(
  ([value, label]) => ({ value, label, subtitle: GOAL_SUBTITLES[value] }),
);

const LEVEL_OPTIONS = (Object.entries(LEVEL_LABELS) as [OnboardingAnswers['level'], string][]).map(
  ([value, label]) => ({ value, label }),
);

const BODY_REGIONS = Object.keys(BODY_REGION_LABELS) as BodyRegion[];
const RESTRICTIONS = Object.keys(RESTRICTION_LABELS) as Restriction[];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function fieldLabel(text: string) {
  return <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">{text}</p>;
}

interface OnboardingScreenProps {
  gymName: string;
  initialAnswers: OnboardingAnswers;
  onComplete: (answers: OnboardingAnswers) => void;
  onExit: () => void;
}

export function OnboardingScreen({ gymName, initialAnswers, onComplete, onExit }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);

  const isFirstStep = step === 0;
  const isLastStep = step === ONBOARDING_STEP_COUNT - 1;
  const ctaLabel = isFirstStep ? 'Começar' : isLastStep ? 'Ver minhas metas' : 'Continuar';

  const handleBack = () => {
    if (isFirstStep) {
      onExit();
      return;
    }
    setStep((current) => current - 1);
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(answers);
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <div className="flex items-center gap-4 px-5 pt-10 pb-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="bg-surface-2 rounded-icon flex size-9 shrink-0 cursor-pointer items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1">
          <ProgressBar
            value={step}
            max={ONBOARDING_STEP_COUNT - 1}
            label="Progresso do onboarding"
          />
        </div>
        <span className="text-subtle text-sm font-bold tabular-nums">
          {step}/{ONBOARDING_STEP_COUNT - 1}
        </span>
      </div>

      <div className="flex-1 px-5 py-5">
        {step === 0 ? (
          <div>
            <h1 className="font-display text-4xl leading-none font-extrabold uppercase">
              Bem-vindo à <span className="text-brand">{gymName}</span>
            </h1>
            <p className="text-subtle mt-4 text-base leading-relaxed">
              Responda a avaliação inicial. Com base nas suas respostas calculamos suas metas de
              dieta e seu professor monta seu treino personalizado.
            </p>
            <ul className="text-fg-muted mt-6 flex flex-col gap-3 text-sm">
              <li>Seu corpo e objetivo</li>
              <li>Nível e frequência</li>
              <li>Triagem de saúde e restrições</li>
            </ul>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase">Sobre você</h1>
            <p className="text-subtle mt-2 text-sm">
              Sexo biológico e idade — base pro cálculo do seu gasto calórico.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {SEX_OPTIONS.map((option) => (
                <OnboardingOption
                  key={option.value}
                  label={option.label}
                  selected={answers.sex === option.value}
                  onClick={() => setAnswers({ ...answers, sex: option.value })}
                />
              ))}
            </div>
            <div className="mt-5">
              {fieldLabel('Idade')}
              <Stepper
                value={answers.age}
                step={1}
                min={AGE_LIMITS.min}
                max={AGE_LIMITS.max}
                unit="anos"
                onChange={(age) => setAnswers({ ...answers, age })}
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase">Peso e altura</h1>
            <p className="text-subtle mt-2 text-sm">Base pro cálculo das suas calorias e macros.</p>
            <div className="mt-5 flex flex-col gap-3">
              <div>
                {fieldLabel('Peso')}
                <Stepper
                  value={answers.weight}
                  step={1}
                  min={WEIGHT_LIMITS.min}
                  max={WEIGHT_LIMITS.max}
                  unit="kg"
                  onChange={(weight) => setAnswers({ ...answers, weight })}
                />
              </div>
              <div>
                {fieldLabel('Altura')}
                <Stepper
                  value={answers.height}
                  step={1}
                  min={HEIGHT_LIMITS.min}
                  max={HEIGHT_LIMITS.max}
                  unit="cm"
                  onChange={(height) => setAnswers({ ...answers, height })}
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase">Qual seu objetivo?</h1>
            <p className="text-subtle mt-2 text-sm">Isso define seus macros e o foco do treino.</p>
            <div className="mt-5 flex flex-col gap-2">
              {GOAL_OPTIONS.map((option) => (
                <OnboardingOption
                  key={option.value}
                  label={option.label}
                  subtitle={option.subtitle}
                  selected={answers.goal === option.value}
                  onClick={() => setAnswers({ ...answers, goal: option.value })}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase">Nível e frequência</h1>
            <p className="text-subtle mt-2 text-sm">
              Sua experiência e quantos dias por semana você treina.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {LEVEL_OPTIONS.map((option) => (
                <OnboardingOption
                  key={option.value}
                  label={option.label}
                  selected={answers.level === option.value}
                  onClick={() => setAnswers({ ...answers, level: option.value })}
                />
              ))}
            </div>
            <div className="mt-4">
              {fieldLabel('Dias por semana')}
              <Stepper
                value={answers.daysPerWeek}
                step={1}
                min={DAYS_PER_WEEK_LIMITS.min}
                max={DAYS_PER_WEEK_LIMITS.max}
                unit="dias"
                onChange={(daysPerWeek) => setAnswers({ ...answers, daysPerWeek })}
              />
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase">
              Alguma lesão ou limitação?
            </h1>
            <p className="text-subtle mt-2 text-sm">
              Seu professor evita e substitui os exercícios que forçam essa região.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {BODY_REGIONS.map((region) => (
                <OnboardingOption
                  key={region}
                  label={BODY_REGION_LABELS[region]}
                  selected={answers.injuries.includes(region)}
                  onClick={() => setAnswers({ ...answers, injuries: toggle(answers.injuries, region) })}
                />
              ))}
              <OnboardingOption
                label="Nenhuma"
                selected={answers.injuries.length === 0}
                onClick={() => setAnswers({ ...answers, injuries: [] })}
              />
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase">Restrições alimentares</h1>
            <p className="text-subtle mt-2 text-sm">Pra filtrar as sugestões da sua dieta.</p>
            <div className="mt-5 flex flex-col gap-2">
              {RESTRICTIONS.map((restriction) => (
                <OnboardingOption
                  key={restriction}
                  label={RESTRICTION_LABELS[restriction]}
                  selected={answers.restrictions.includes(restriction)}
                  onClick={() =>
                    setAnswers({ ...answers, restrictions: toggle(answers.restrictions, restriction) })
                  }
                />
              ))}
              <OnboardingOption
                label="Nenhuma"
                selected={answers.restrictions.length === 0}
                onClick={() => setAnswers({ ...answers, restrictions: [] })}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="px-5 pb-10">
        <Button fullWidth onClick={handleNext}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
