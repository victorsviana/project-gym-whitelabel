import type { Session } from '@gym/core';

/** Separada do envelope de dados — limpar dados de demonstração não derruba o login. */
const SESSION_KEY = 'gymapp:session';

export function loadSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
