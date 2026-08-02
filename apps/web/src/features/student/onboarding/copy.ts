import type { Goal } from '@gym/core';

/** Subtítulo explicativo de cada objetivo (UI-SPEC.md#onboarding — 7 passos). */
export const GOAL_SUBTITLES: Record<Goal, string> = {
  muscle: 'Superávit calórico + força',
  cut: 'Déficit calórico + preservar músculo',
  performance: 'Manutenção e condicionamento',
};

/** Como o objetivo aparece dentro da frase da tela de metas prontas ("foco em ganho de massa"). */
export const GOAL_FOCUS_LABELS: Record<Goal, string> = {
  muscle: 'ganho de massa',
  cut: 'perda de gordura',
  performance: 'performance',
};

/** Mensagens em sequência da tela de processamento — teatro deliberado (UI-SPEC.md). */
export const ANALYZING_MESSAGES = [
  'Lendo sua avaliação...',
  'Calculando gasto calórico...',
  'Ajustando macros...',
  'Preparando seu treino...',
] as const;
