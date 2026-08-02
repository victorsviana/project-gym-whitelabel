import {
  addDays,
  computeDailyGoal,
  createId,
  todayIsoDate,
  type Assignment,
  type DailyGoal,
  type Gym,
  type Notice,
  type PlanExercise,
  type StudentProfile,
  type User,
  type WorkoutPlan,
} from '@gym/core';
import { createEmptyStorageData, type StorageData } from '../schema';
import { SEED_FOODS } from './foods';
import { SEED_GYMS, SEED_PASSWORD } from './gym-data';
import { generateStudentHistory, type HistoryFood, type HistoryPlan } from './history';

/** Exercícios só por tempo ("40s") não têm carga registrada — não faz sentido pedir "kg" de prancha. */
function isTimedExercise(reps: string): boolean {
  return /^\d+s$/.test(reps.trim());
}

function toIsoDatetime(daysAgo: number, hour: string): string {
  return `${addDays(todayIsoDate(), -daysAgo)}T${hour}`;
}

/**
 * Monta o dataset completo de demonstração — três academias com professor, alunos, planos,
 * atribuições, metas e histórico — pronto para gravar de uma vez no envelope de `localStorage`.
 * Pura: não toca em `localStorage`, só monta dados; quem grava é `seed.ts`.
 */
export function buildSeedData(): StorageData {
  const now = new Date().toISOString();
  const data = createEmptyStorageData();

  const globalFoods: HistoryFood[] = SEED_FOODS.map((food) => ({ ...food, id: createId() }));
  data.foods = globalFoods.map((food) => ({
    id: food.id,
    gymId: null,
    name: food.name,
    kcal: food.kcal,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    defaultQuantity: food.defaultQuantity,
  }));

  for (const seedGym of SEED_GYMS) {
    const gymId = createId();
    const gym: Gym = {
      id: gymId,
      name: seedGym.name,
      slug: seedGym.slug,
      initials: seedGym.initials,
      logo: null,
      theme: seedGym.theme,
      createdAt: now,
    };
    data.gyms.push(gym);

    const trainerId = createId();
    const trainer: User = {
      id: trainerId,
      gymId,
      role: 'trainer',
      name: seedGym.trainerName,
      email: seedGym.trainerEmail,
      password: SEED_PASSWORD,
      active: true,
      createdAt: now,
    };
    data.users.push(trainer);

    const plansByLetter = new Map<string, WorkoutPlan>();
    for (const seedPlan of seedGym.plans) {
      const exercises: PlanExercise[] = seedPlan.exercises.map((exercise, index) => ({
        id: createId(),
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        order: index,
        sensitiveRegions: exercise.sensitiveRegions ?? [],
      }));

      const plan: WorkoutPlan = {
        id: createId(),
        gymId,
        letter: seedPlan.letter,
        name: seedPlan.name,
        focus: seedPlan.focus,
        weekday: seedPlan.weekday,
        duration: seedPlan.duration,
        exercises,
        published: !seedPlan.draft,
        createdBy: trainerId,
        createdAt: now,
        updatedAt: now,
      };
      data.plans.push(plan);
      plansByLetter.set(seedPlan.letter, plan);
    }

    for (const seedStudent of seedGym.students) {
      const studentId = createId();
      const onboardedAt = toIsoDatetime(seedStudent.onboardedDaysAgo, '09:00:00.000Z');

      const student: User = {
        id: studentId,
        gymId,
        role: 'student',
        name: seedStudent.name,
        email: seedStudent.email,
        password: SEED_PASSWORD,
        active: true,
        createdAt: onboardedAt,
      };
      data.users.push(student);

      const profile: StudentProfile = {
        studentId,
        gymId,
        sex: seedStudent.sex,
        age: seedStudent.age,
        weight: seedStudent.weight,
        height: seedStudent.height,
        goal: seedStudent.goal,
        level: seedStudent.level,
        daysPerWeek: seedStudent.daysPerWeek,
        injuries: seedStudent.injuries,
        restrictions: seedStudent.restrictions,
        onboardedAt,
      };
      data.profiles.push(profile);

      const computed = computeDailyGoal({
        sex: seedStudent.sex,
        age: seedStudent.age,
        weight: seedStudent.weight,
        height: seedStudent.height,
        goal: seedStudent.goal,
        daysPerWeek: seedStudent.daysPerWeek,
      });
      const goal: DailyGoal = {
        studentId,
        gymId,
        kcal: computed.kcal,
        protein: computed.protein,
        carbs: computed.carbs,
        fat: computed.fat,
        water: computed.water,
        source: 'computed',
        updatedAt: now,
      };
      data.goals.push(goal);

      const assignedPlans: HistoryPlan[] = [];
      seedStudent.assignedPlanLetters.forEach((letter, order) => {
        const plan = plansByLetter.get(letter);
        if (!plan) return;

        const assignment: Assignment = {
          id: createId(),
          gymId,
          planId: plan.id,
          studentId,
          order,
          active: true,
          assignedAt: onboardedAt,
          assignedBy: trainerId,
        };
        data.assignments.push(assignment);

        assignedPlans.push({
          id: plan.id,
          exercises: plan.exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            sets: exercise.sets,
            isTimed: isTimedExercise(exercise.reps),
          })),
        });
      });

      const history = generateStudentHistory({
        gymId,
        studentId,
        seedKey: `${seedGym.slug}:${seedStudent.email}`,
        daysPerWeek: seedStudent.daysPerWeek,
        historyDays: seedStudent.historyDays,
        assignedPlans,
        goal: { kcal: computed.kcal, water: computed.water },
        restrictions: seedStudent.restrictions,
        foods: globalFoods,
        forceTodayActive: seedGym.slug === 'gavioes' && seedStudent.email === 'victor@aluno.com',
      });
      data.setLogs.push(...history.setLogs);
      data.loadLogs.push(...history.loadLogs);
      data.meals.push(...history.meals);
      data.waterLogs.push(...history.waterLogs);
      data.activity.push(...history.activityDays);

      if (seedStudent.notice) {
        const notice: Notice = {
          id: createId(),
          gymId,
          studentId,
          kind: seedStudent.notice.kind,
          text: seedStudent.notice.text,
          resolved: false,
          createdAt: now,
          resolvedAt: null,
        };
        data.notices.push(notice);
      }
    }
  }

  return data;
}
