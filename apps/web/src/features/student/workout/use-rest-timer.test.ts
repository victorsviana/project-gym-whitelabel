import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REST_ALERT_THRESHOLD_SEC, REST_PRESETS_SEC, useRestTimer } from './use-rest-timer';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useRestTimer', () => {
  it('inicia com o valor exato da predefinição', () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(90));

    expect(result.current.running).toBe(true);
    expect(result.current.activePreset).toBe(90);
    expect(result.current.remainingSec).toBe(90);
  });

  it('deriva o restante do relógio real — um tique atrasado não faz sobrar tempo (mesma correção do #8)', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => result.current.start(90));

    // Aba em segundo plano: 86s reais se passam sem nenhum tique de 1s disparar.
    act(() => vi.setSystemTime(Date.now() + 86_000));
    expect(result.current.remainingSec).toBe(90); // sem tique ainda, nenhum redesenho

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remainingSec).toBe(3);
  });

  it('para sozinho ao chegar em zero', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => result.current.start(60));

    act(() => vi.advanceTimersByTime(60_000));

    expect(result.current.remainingSec).toBe(0);
    expect(result.current.running).toBe(false);
    expect(result.current.activePreset).toBeNull();
  });

  it('expõe as três predefinições e o limiar de alerta de UI-SPEC.md', () => {
    expect(REST_PRESETS_SEC).toEqual([60, 90, 120]);
    expect(REST_ALERT_THRESHOLD_SEC).toBe(10);
  });
});
