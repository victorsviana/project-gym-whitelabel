import type { Gym, GymRepository } from '@gym/core';
import { loadData, saveData } from './store';

export function createGymRepository(): GymRepository {
  return {
    async list() {
      return loadData().gyms;
    },

    async findById(gymId) {
      return loadData().gyms.find((gym) => gym.id === gymId) ?? null;
    },

    async findBySlug(slug) {
      return loadData().gyms.find((gym) => gym.slug === slug) ?? null;
    },

    async save(gym: Gym) {
      const data = loadData();
      const index = data.gyms.findIndex((existing) => existing.id === gym.id);
      if (index === -1) {
        data.gyms.push(gym);
      } else {
        data.gyms[index] = gym;
      }
      saveData(data);
    },
  };
}
