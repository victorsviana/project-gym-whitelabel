import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('useSessionStore', () => {
  it('login grava a sessão em localStorage e logout limpa', async () => {
    const { useSessionStore } = await import('./use-session');
    const session = {
      userId: 'u1',
      gymId: 'g1',
      role: 'student' as const,
      startedAt: new Date().toISOString(),
    };

    useSessionStore.getState().login(session);
    expect(JSON.parse(localStorage.getItem('gymapp:session')!)).toEqual(session);

    useSessionStore.getState().logout();
    expect(localStorage.getItem('gymapp:session')).toBeNull();
  });

  it('sessão sobrevive a um recarregamento — módulo novo lê o que já estava salvo', async () => {
    const { saveSession } = await import('../../storage/session-store');
    const session = {
      userId: 'u2',
      gymId: 'g1',
      role: 'trainer' as const,
      startedAt: new Date().toISOString(),
    };
    saveSession(session);

    vi.resetModules();
    const { useSessionStore } = await import('./use-session');

    expect(useSessionStore.getState().session).toEqual(session);
  });
});
