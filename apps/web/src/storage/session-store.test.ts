import { beforeEach, describe, expect, it } from 'vitest';
import { clearSession, loadSession, saveSession } from './session-store';

beforeEach(() => {
  localStorage.clear();
});

describe('session-store', () => {
  it('devolve null sem sessão salva', () => {
    expect(loadSession()).toBeNull();
  });

  it('persiste e lê a sessão de volta', () => {
    saveSession({ userId: 'u1', gymId: 'g1', role: 'trainer', startedAt: new Date().toISOString() });
    expect(loadSession()?.userId).toBe('u1');
  });

  it('fica em chave separada de gymapp:v1 — limpar uma não mexe na outra', () => {
    localStorage.setItem('gymapp:v1', JSON.stringify({ version: 1, updatedAt: '', data: {} }));
    saveSession({ userId: 'u1', gymId: 'g1', role: 'trainer', startedAt: new Date().toISOString() });

    clearSession();

    expect(loadSession()).toBeNull();
    expect(localStorage.getItem('gymapp:v1')).not.toBeNull();
  });
});
