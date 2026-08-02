import type {
  ActivityDay,
  Assignment,
  DailyGoal,
  Food,
  Gym,
  LoadLog,
  Meal,
  Notice,
  SetLog,
  StudentProfile,
  User,
  WaterLog,
  WorkoutPlan,
} from '@gym/core';

/** Versão atual do schema salvo em `gymapp:v1`. Suba a cada mudança de formato e escreva a migração em `migrations.ts`. */
export const SCHEMA_VERSION = 1;

/** Coleções planas — índices por `gymId` são construídos em memória na leitura, não aninhados por academia. */
export interface StorageData {
  gyms: Gym[];
  users: User[];
  profiles: StudentProfile[];
  goals: DailyGoal[];
  plans: WorkoutPlan[];
  assignments: Assignment[];
  setLogs: SetLog[];
  loadLogs: LoadLog[];
  meals: Meal[];
  waterLogs: WaterLog[];
  activity: ActivityDay[];
  notices: Notice[];
  foods: Food[];
}

export function createEmptyStorageData(): StorageData {
  return {
    gyms: [],
    users: [],
    profiles: [],
    goals: [],
    plans: [],
    assignments: [],
    setLogs: [],
    loadLogs: [],
    meals: [],
    waterLogs: [],
    activity: [],
    notices: [],
    foods: [],
  };
}

export interface StorageEnvelope {
  version: number;
  updatedAt: string;
  data: StorageData;
}
