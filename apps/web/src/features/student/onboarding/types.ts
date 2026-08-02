import type { BodyRegion, Goal, Level, Restriction, Sex } from '@gym/core';

export interface OnboardingAnswers {
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  injuries: BodyRegion[];
  restrictions: Restriction[];
}

export const ONBOARDING_DEFAULTS: OnboardingAnswers = {
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

export const AGE_LIMITS = { min: 14, max: 90 };
export const WEIGHT_LIMITS = { min: 35, max: 220 };
export const HEIGHT_LIMITS = { min: 130, max: 220 };
export const DAYS_PER_WEEK_LIMITS = { min: 1, max: 7 };

export const ONBOARDING_STEP_COUNT = 7;
