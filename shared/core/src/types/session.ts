import type { Role } from './common';

/** Sessão local. Não é entidade de negócio, mas persiste. */
export interface Session {
  userId: string;
  gymId: string;
  role: Role;
  startedAt: string;
}
