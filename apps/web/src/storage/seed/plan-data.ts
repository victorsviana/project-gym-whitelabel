import type { BodyRegion } from '@gym/core';

export interface SeedExercise {
  name: string;
  sets: number;
  reps: string;
  sensitiveRegions?: BodyRegion[];
}

export interface SeedPlan {
  letter: string;
  name: string;
  focus: string;
  weekday: string;
  duration: string;
  exercises: SeedExercise[];
  /** Rascunho vazio, para exercitar o estado vazio — não é atribuído a ninguém. */
  draft?: boolean;
}

/**
 * Planos A–E: exercícios reproduzidos de `prototype/extracted/logic.js` (`defaultPlans`).
 * O plano D carrega exercícios sensíveis a `ombro`, que é o que faz Bruno Nunes ver o selo
 * Adaptado quando o plano for atribuído a ele (SEED-DATA.md).
 */
export const GAVIOES_PLANS: SeedPlan[] = [
  {
    letter: 'A',
    name: 'Peito e Tríceps',
    focus: 'Empurrar',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [
      { name: 'Supino reto com halteres', sets: 4, reps: '8–10' },
      { name: 'Supino inclinado máquina', sets: 3, reps: '10' },
      { name: 'Crucifixo na polia', sets: 3, reps: '12' },
      { name: 'Tríceps corda', sets: 4, reps: '12–15' },
      { name: 'Tríceps francês', sets: 3, reps: '12' },
    ],
  },
  {
    letter: 'B',
    name: 'Costas e Bíceps',
    focus: 'Puxar',
    weekday: 'Terça',
    duration: '55 min',
    exercises: [
      { name: 'Puxada frente aberta', sets: 4, reps: '10' },
      { name: 'Remada curvada', sets: 4, reps: '10' },
      { name: 'Remada baixa', sets: 3, reps: '12' },
      { name: 'Rosca direta barra', sets: 3, reps: '12' },
      { name: 'Rosca martelo', sets: 3, reps: '12' },
    ],
  },
  {
    letter: 'C',
    name: 'Pernas completo',
    focus: 'Inferiores',
    weekday: 'Quarta',
    duration: '60 min',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: '8–10' },
      { name: 'Leg press 45°', sets: 4, reps: '12' },
      { name: 'Cadeira extensora', sets: 3, reps: '15' },
      { name: 'Mesa flexora', sets: 3, reps: '12' },
      { name: 'Panturrilha em pé', sets: 4, reps: '15–20' },
    ],
  },
  {
    letter: 'D',
    name: 'Ombro e Abdômen',
    focus: 'Empurrar',
    weekday: 'Quinta',
    duration: '50 min',
    exercises: [
      { name: 'Desenvolvimento máquina', sets: 4, reps: '10', sensitiveRegions: ['shoulder'] },
      { name: 'Elevação lateral', sets: 4, reps: '12', sensitiveRegions: ['shoulder'] },
      { name: 'Elevação frontal', sets: 3, reps: '12' },
      { name: 'Abdominal supra', sets: 4, reps: '20' },
      { name: 'Prancha', sets: 3, reps: '40s' },
    ],
  },
  {
    letter: 'E',
    name: 'Full body / Glúteo',
    focus: 'Geral',
    weekday: 'Sexta',
    duration: '55 min',
    exercises: [
      { name: 'Levantamento terra', sets: 4, reps: '8' },
      { name: 'Afundo com halteres', sets: 3, reps: '12' },
      { name: 'Elevação pélvica', sets: 4, reps: '12' },
      { name: 'Remada máquina', sets: 3, reps: '12' },
      { name: 'Rosca inversa', sets: 3, reps: '15' },
    ],
  },
  {
    letter: 'F',
    name: 'Novo treino',
    focus: '—',
    weekday: '—',
    duration: '—',
    exercises: [],
    draft: true,
  },
];

export const BLUEFIT_PLANS: SeedPlan[] = [
  {
    letter: 'A',
    name: 'Superiores',
    focus: 'Empurrar e puxar',
    weekday: 'Segunda',
    duration: '50 min',
    exercises: [
      { name: 'Supino reto barra', sets: 4, reps: '8–10' },
      { name: 'Puxada frente', sets: 4, reps: '10' },
      { name: 'Desenvolvimento com halteres', sets: 3, reps: '10', sensitiveRegions: ['shoulder'] },
      { name: 'Remada baixa', sets: 3, reps: '12' },
      { name: 'Rosca direta', sets: 3, reps: '12' },
      { name: 'Tríceps corda', sets: 3, reps: '12' },
    ],
  },
  {
    letter: 'B',
    name: 'Inferiores',
    focus: 'Pernas',
    weekday: 'Quarta',
    duration: '55 min',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: '8–10', sensitiveRegions: ['lower_back'] },
      { name: 'Leg press 45°', sets: 4, reps: '12' },
      { name: 'Cadeira extensora', sets: 3, reps: '15' },
      { name: 'Mesa flexora', sets: 3, reps: '12' },
      { name: 'Panturrilha em pé', sets: 4, reps: '15–20' },
    ],
  },
  {
    letter: 'C',
    name: 'Full body',
    focus: 'Geral',
    weekday: 'Sexta',
    duration: '50 min',
    exercises: [
      { name: 'Levantamento terra', sets: 4, reps: '8', sensitiveRegions: ['lower_back'] },
      { name: 'Supino inclinado com halteres', sets: 3, reps: '10' },
      { name: 'Remada curvada', sets: 3, reps: '10', sensitiveRegions: ['lower_back'] },
      { name: 'Elevação lateral', sets: 3, reps: '12', sensitiveRegions: ['shoulder'] },
      { name: 'Abdominal supra', sets: 4, reps: '20' },
    ],
  },
];

export const IRON_HOUSE_PLANS: SeedPlan[] = [
  {
    letter: 'A',
    name: 'Push',
    focus: 'Empurrar',
    weekday: 'Segunda',
    duration: '55 min',
    exercises: [
      { name: 'Supino reto barra', sets: 4, reps: '8–10' },
      { name: 'Desenvolvimento militar', sets: 4, reps: '8', sensitiveRegions: ['shoulder'] },
      { name: 'Elevação lateral', sets: 3, reps: '12', sensitiveRegions: ['shoulder'] },
      { name: 'Tríceps testa', sets: 3, reps: '12' },
      { name: 'Tríceps corda', sets: 3, reps: '15' },
    ],
  },
  {
    letter: 'B',
    name: 'Pull',
    focus: 'Puxar',
    weekday: 'Terça',
    duration: '55 min',
    exercises: [
      { name: 'Barra fixa', sets: 4, reps: '8–10' },
      { name: 'Remada curvada', sets: 4, reps: '10', sensitiveRegions: ['lower_back'] },
      { name: 'Puxada frente', sets: 3, reps: '10' },
      { name: 'Rosca direta', sets: 3, reps: '12' },
      { name: 'Rosca martelo', sets: 3, reps: '12' },
    ],
  },
  {
    letter: 'C',
    name: 'Legs',
    focus: 'Inferiores',
    weekday: 'Quinta',
    duration: '60 min',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: '8', sensitiveRegions: ['lower_back'] },
      { name: 'Leg press 45°', sets: 4, reps: '12' },
      { name: 'Stiff com halteres', sets: 3, reps: '10', sensitiveRegions: ['lower_back'] },
      { name: 'Cadeira extensora', sets: 3, reps: '15' },
      { name: 'Panturrilha em pé', sets: 4, reps: '20' },
    ],
  },
  {
    letter: 'D',
    name: 'Condicionamento',
    focus: 'Geral',
    weekday: 'Sexta',
    duration: '45 min',
    exercises: [
      { name: 'Burpee', sets: 4, reps: '15' },
      { name: 'Corda naval', sets: 4, reps: '30s' },
      { name: 'Kettlebell swing', sets: 4, reps: '20', sensitiveRegions: ['lower_back'] },
      { name: 'Mountain climber', sets: 3, reps: '40s' },
      { name: 'Prancha', sets: 3, reps: '45s' },
    ],
  },
];
