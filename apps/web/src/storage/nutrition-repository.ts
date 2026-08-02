import type { Meal, NutritionRepository, WaterLog } from '@gym/core';
import { loadData, saveData } from './store';

export function createNutritionRepository(): NutritionRepository {
  return {
    async listMeals(gymId, studentId, date) {
      return loadData().meals.filter(
        (meal) => meal.gymId === gymId && meal.studentId === studentId && meal.date === date,
      );
    },

    async listMealsInRange(gymId, studentId, from, to) {
      return loadData().meals.filter(
        (meal) =>
          meal.gymId === gymId &&
          meal.studentId === studentId &&
          meal.date >= from &&
          meal.date <= to,
      );
    },

    async saveMeal(meal: Meal) {
      const data = loadData();
      const index = data.meals.findIndex((existing) => existing.id === meal.id);
      if (index === -1) {
        data.meals.push(meal);
      } else {
        data.meals[index] = meal;
      }
      saveData(data);
    },

    async removeMeal(gymId, mealId) {
      const data = loadData();
      data.meals = data.meals.filter((meal) => !(meal.gymId === gymId && meal.id === mealId));
      saveData(data);
    },

    async findWaterLog(gymId, studentId, date) {
      return (
        loadData().waterLogs.find(
          (log) => log.gymId === gymId && log.studentId === studentId && log.date === date,
        ) ?? null
      );
    },

    async saveWaterLog(log: WaterLog) {
      const data = loadData();
      const index = data.waterLogs.findIndex(
        (existing) =>
          existing.gymId === log.gymId &&
          existing.studentId === log.studentId &&
          existing.date === log.date,
      );
      if (index === -1) {
        data.waterLogs.push(log);
      } else {
        data.waterLogs[index] = log;
      }
      saveData(data);
    },

    async listFoods(gymId) {
      return loadData().foods.filter((food) => food.gymId === null || food.gymId === gymId);
    },
  };
}
