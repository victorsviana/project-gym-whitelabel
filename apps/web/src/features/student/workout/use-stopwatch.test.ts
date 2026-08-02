import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStopwatch } from './use-stopwatch';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useStopwatch', () => {
  it('deriva o tempo decorrido do relógio real, não perde tempo se o intervalo atrasar (PROTOTYPE-AUDIT.md#8)', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => result.current.toggle());
    expect(result.current.running).toBe(true);

    // Simula a aba em segundo plano: o tempo passa de verdade, mas o `setInterval` de 1s não dispara nenhum tique.
    act(() => vi.setSystemTime(Date.now() + 5500));
    expect(result.current.elapsedSec).toBe(0); // ainda não houve nenhum tique para redesenhar

    // Quando o navegador finalmente deixa o intervalo disparar de novo (mais 1s), o tique reflete os 6,5s
    // reais decorridos desde o início — um contador ingênuo (incrementado a cada tique) mostraria só 1s aqui.
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.elapsedSec).toBe(6);
  });

  it('pausa acumula o tempo e retomar soma a partir dali', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => result.current.toggle()); // inicia
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.elapsedSec).toBe(3);

    act(() => result.current.toggle()); // pausa
    expect(result.current.running).toBe(false);
    expect(result.current.elapsedSec).toBe(3);

    // Tempo passando enquanto pausado não deve contar.
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.elapsedSec).toBe(3);

    act(() => result.current.toggle()); // retoma
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.elapsedSec).toBe(5);
  });

  it('zerar para o cronômetro e volta a 00:00', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.elapsedSec).toBe(10);

    act(() => result.current.reset());
    expect(result.current.elapsedSec).toBe(0);
    expect(result.current.running).toBe(false);
  });
});
