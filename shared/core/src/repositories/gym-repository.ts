import type { Gym } from '../types';

/** Academias e tema. */
export interface GymRepository {
  list(): Promise<Gym[]>;
  findById(gymId: string): Promise<Gym | null>;
  findBySlug(slug: string): Promise<Gym | null>;
  /** Upsert por `id`. */
  save(gym: Gym): Promise<void>;
}
