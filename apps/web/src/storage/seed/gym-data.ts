import type { BodyRegion, Goal, GymTheme, Level, NoticeKind, Restriction, Sex } from '@gym/core';
import { BLUEFIT_PLANS, GAVIOES_PLANS, IRON_HOUSE_PLANS, type SeedPlan } from './plan-data';

export interface SeedStudent {
  name: string;
  email: string;
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  injuries: BodyRegion[];
  restrictions: Restriction[];
  /** Letras dos planos atribuídos, na ordem da atribuição. Vazio = sem treino (pendência). */
  assignedPlanLetters: string[];
  /** Dias de histórico a gerar, terminando hoje. 0 = aluno recém-cadastrado, sem histórico. */
  historyDays: number;
  /** Há quantos dias foi a avaliação inicial — sempre >= historyDays, para o onboarding preceder o treino. */
  onboardedDaysAgo: number;
  /**
   * Há quantos dias foi a avaliação mais recente — base da pendência de reavaliação (F1-E15,
   * derivada em runtime, > 30 dias). Independente de `onboardedDaysAgo` de propósito: a maioria
   * dos alunos segue "avaliado recentemente" mesmo tendo onboarding antigo (Victor, 47 dias),
   * só Diego representa o caso de reavaliação vencida de SEED-DATA.md.
   */
  lastAssessedDaysAgo: number;
  /** `new_student`/`reassessment` são derivados em runtime (F1-E15) — só `plan_change_request` continua seedado direto, por não ter sinal no modelo que o derive. */
  notice?: { kind: Extract<NoticeKind, 'plan_change_request'>; text: string };
}

export interface SeedGym {
  slug: string;
  name: string;
  initials: string;
  theme: GymTheme;
  trainerName: string;
  trainerEmail: string;
  plans: SeedPlan[];
  students: SeedStudent[];
}

export const SEED_GYMS: SeedGym[] = [
  {
    slug: 'gavioes',
    name: 'Gaviões Fitness',
    initials: 'GF',
    theme: { brand: '#E4022E', brandFg: '#FFFFFF', mode: 'dark' },
    trainerName: 'Douglas Moreira',
    trainerEmail: 'douglas@gavioes.com.br',
    plans: GAVIOES_PLANS,
    students: [
      {
        name: 'Victor Silva',
        email: 'victor@aluno.com',
        sex: 'male',
        age: 29,
        weight: 78,
        height: 179,
        goal: 'muscle',
        level: 'intermediate',
        daysPerWeek: 5,
        injuries: [],
        restrictions: [],
        assignedPlanLetters: ['A', 'B', 'C', 'D', 'E'],
        historyDays: 42,
        onboardedDaysAgo: 47,
        lastAssessedDaysAgo: 10,
      },
      {
        name: 'Rafael Dias',
        email: 'rafael@aluno.com',
        sex: 'male',
        age: 27,
        weight: 82,
        height: 181,
        goal: 'performance',
        level: 'advanced',
        daysPerWeek: 6,
        injuries: ['knee'],
        restrictions: [],
        assignedPlanLetters: ['A', 'B', 'C', 'D', 'E'],
        historyDays: 21,
        onboardedDaysAgo: 28,
        lastAssessedDaysAgo: 28,
        notice: { kind: 'plan_change_request', text: 'Pediu troca de treino (dor no joelho)' },
      },
      {
        name: 'Letícia Prado',
        email: 'leticia@aluno.com',
        sex: 'female',
        age: 24,
        weight: 59,
        height: 162,
        goal: 'muscle',
        level: 'beginner',
        daysPerWeek: 3,
        injuries: [],
        restrictions: ['vegetarian'],
        assignedPlanLetters: ['A', 'B', 'C'],
        historyDays: 10,
        onboardedDaysAgo: 16,
        lastAssessedDaysAgo: 16,
      },
      {
        name: 'Bruno Nunes',
        email: 'bruno@aluno.com',
        sex: 'male',
        age: 38,
        weight: 90,
        height: 175,
        goal: 'cut',
        level: 'beginner',
        daysPerWeek: 3,
        injuries: ['shoulder'],
        restrictions: [],
        assignedPlanLetters: [],
        historyDays: 0,
        onboardedDaysAgo: 2,
        lastAssessedDaysAgo: 2,
      },
      {
        name: 'Camila Reis',
        email: 'camila@aluno.com',
        sex: 'female',
        age: 28,
        weight: 66,
        height: 170,
        goal: 'muscle',
        level: 'intermediate',
        daysPerWeek: 4,
        injuries: [],
        restrictions: [],
        assignedPlanLetters: ['A', 'B', 'C', 'D'],
        historyDays: 14,
        onboardedDaysAgo: 20,
        lastAssessedDaysAgo: 20,
      },
    ],
  },
  {
    slug: 'bluefit',
    name: 'Bluefit',
    initials: 'BF',
    theme: { brand: '#2E7BFF', brandFg: '#FFFFFF', mode: 'light' },
    trainerName: 'Renata Alves',
    trainerEmail: 'renata@bluefit.com.br',
    plans: BLUEFIT_PLANS,
    students: [
      {
        name: 'Marina Costa',
        email: 'marina@aluno.com',
        sex: 'female',
        age: 33,
        weight: 64,
        height: 166,
        goal: 'cut',
        level: 'intermediate',
        daysPerWeek: 4,
        injuries: ['lower_back'],
        restrictions: ['lactose'],
        assignedPlanLetters: ['A', 'B', 'C'],
        historyDays: 28,
        onboardedDaysAgo: 34,
        lastAssessedDaysAgo: 10,
      },
      {
        name: 'Thiago Marques',
        email: 'thiago@aluno.com',
        sex: 'male',
        age: 31,
        weight: 88,
        height: 184,
        goal: 'muscle',
        level: 'intermediate',
        daysPerWeek: 5,
        injuries: [],
        restrictions: [],
        assignedPlanLetters: ['A', 'B', 'C'],
        historyDays: 14,
        onboardedDaysAgo: 20,
        lastAssessedDaysAgo: 20,
      },
      {
        name: 'Ana Prado',
        email: 'ana@aluno.com',
        sex: 'female',
        age: 26,
        weight: 61,
        height: 168,
        goal: 'performance',
        level: 'beginner',
        daysPerWeek: 3,
        injuries: [],
        restrictions: [],
        assignedPlanLetters: [],
        historyDays: 0,
        onboardedDaysAgo: 3,
        lastAssessedDaysAgo: 3,
      },
    ],
  },
  {
    slug: 'iron-house',
    name: 'Iron House',
    initials: 'IH',
    theme: { brand: '#FF6B2C', brandFg: '#0A0B0A', mode: 'dark' },
    trainerName: 'Marcos Vieira',
    trainerEmail: 'marcos@ironhouse.com.br',
    plans: IRON_HOUSE_PLANS,
    students: [
      {
        name: 'Camila Reis',
        email: 'camila@aluno.com',
        sex: 'female',
        age: 30,
        weight: 63,
        height: 165,
        goal: 'performance',
        level: 'advanced',
        daysPerWeek: 5,
        injuries: [],
        restrictions: [],
        assignedPlanLetters: ['A', 'B', 'C', 'D'],
        historyDays: 14,
        onboardedDaysAgo: 20,
        lastAssessedDaysAgo: 20,
      },
      {
        name: 'Diego Ramos',
        email: 'diego@aluno.com',
        sex: 'male',
        age: 35,
        weight: 95,
        height: 178,
        goal: 'cut',
        level: 'advanced',
        daysPerWeek: 6,
        injuries: ['shoulder', 'lower_back'],
        restrictions: [],
        assignedPlanLetters: ['A', 'B', 'C', 'D'],
        historyDays: 35,
        onboardedDaysAgo: 45,
        lastAssessedDaysAgo: 45,
      },
    ],
  },
];

/** Senha mockada de todas as contas de demonstração (SEED-DATA.md). */
export const SEED_PASSWORD = 'demo1234';
