import type { Session } from '@gym/core';
import { create } from 'zustand';
import { clearSession, loadSession, saveSession } from '../../storage/session-store';

interface SessionState {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
}

/** Estado reativo sobre `storage/session-store.ts` — a leitura inicial já traz a sessão que sobreviveu ao reload. */
export const useSessionStore = create<SessionState>((set) => ({
  session: loadSession(),
  login: (session) => {
    saveSession(session);
    set({ session });
  },
  logout: () => {
    clearSession();
    set({ session: null });
  },
}));
