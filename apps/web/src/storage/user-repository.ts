import type { User, UserRepository } from '@gym/core';
import { clearSession, loadSession, saveSession } from './session-store';
import { loadData, saveData } from './store';

export function createUserRepository(): UserRepository {
  return {
    async findById(gymId, userId) {
      return (
        loadData().users.find((user) => user.gymId === gymId && user.id === userId) ?? null
      );
    },

    async findByEmail(gymId, email) {
      return loadData().users.find((user) => user.gymId === gymId && user.email === email) ?? null;
    },

    async listByGym(gymId, role) {
      return loadData().users.filter(
        (user) => user.gymId === gymId && (role === undefined || user.role === role),
      );
    },

    async save(user: User) {
      const data = loadData();
      const index = data.users.findIndex((existing) => existing.id === user.id);
      if (index === -1) {
        data.users.push(user);
      } else {
        data.users[index] = user;
      }
      saveData(data);
    },

    async getSession() {
      return loadSession();
    },

    async startSession(session) {
      saveSession(session);
    },

    async endSession() {
      clearSession();
    },
  };
}
