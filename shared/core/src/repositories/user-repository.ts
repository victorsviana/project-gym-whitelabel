import type { Role, Session, User } from '../types';

/** Contas e sessão. */
export interface UserRepository {
  findById(gymId: string, userId: string): Promise<User | null>;
  /** E-mail é único dentro da academia, não globalmente. */
  findByEmail(gymId: string, email: string): Promise<User | null>;
  listByGym(gymId: string, role?: Role): Promise<User[]>;
  /** Upsert por `id`. */
  save(user: User): Promise<void>;

  getSession(): Promise<Session | null>;
  startSession(session: Session): Promise<void>;
  endSession(): Promise<void>;
}
