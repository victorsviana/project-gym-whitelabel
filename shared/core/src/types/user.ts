import type { Role } from './common';

export interface User {
  id: string;
  gymId: string;
  role: Role;
  name: string;
  /** E-mail único dentro da academia. */
  email: string;
  /** Fase 1: mockado, guardado em claro. Fase 2: hash argon2. */
  password: string;
  active: boolean;
  createdAt: string;
}
