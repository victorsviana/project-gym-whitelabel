import type { BodyRegion, Goal, Level, Restriction, StudentStatus } from '@gym/core';

export const GOAL_LABELS: Record<Goal, string> = {
  muscle: 'Massa',
  cut: 'Secar',
  performance: 'Performance',
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  shoulder: 'Ombro',
  knee: 'Joelho',
  lower_back: 'Lombar',
  wrist: 'Punho',
};

export const RESTRICTION_LABELS: Record<Restriction, string> = {
  lactose: 'Lactose',
  gluten: 'Glúten',
  vegetarian: 'Vegetariano',
  vegan: 'Vegano',
};

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: 'Ativo',
  no_plan: 'Sem treino',
  needs_review: 'A revisar',
};
