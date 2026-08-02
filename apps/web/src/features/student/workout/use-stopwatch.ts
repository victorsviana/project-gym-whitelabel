import { useEffect, useRef, useState } from 'react';

export interface Stopwatch {
  elapsedSec: number;
  running: boolean;
  toggle: () => void;
  reset: () => void;
}

/**
 * O tempo decorrido é sempre derivado de `Date.now()` num instante de início guardado em ref, nunca
 * de um contador incrementado a cada tique de `setInterval` — o intervalo só redesenha. Corrige o
 * defeito #8 do protótipo (PROTOTYPE-AUDIT.md): a aba oculta ou o celular bloqueado estrangulam o
 * `setInterval`, mas quando ele volta a disparar o cálculo continua correto porque parte do relógio
 * real, não de incrementos que ficaram perdidos enquanto throttled.
 */
export function useStopwatch(): Stopwatch {
  const [running, setRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const baseSecRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt === null) return;
      setElapsedSec(baseSecRef.current + Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const toggle = () => {
    if (running) {
      const startedAt = startedAtRef.current;
      if (startedAt !== null) baseSecRef.current += Math.floor((Date.now() - startedAt) / 1000);
      startedAtRef.current = null;
      setRunning(false);
      setElapsedSec(baseSecRef.current);
    } else {
      startedAtRef.current = Date.now();
      setRunning(true);
    }
  };

  const reset = () => {
    startedAtRef.current = null;
    baseSecRef.current = 0;
    setRunning(false);
    setElapsedSec(0);
  };

  return { elapsedSec, running, toggle, reset };
}
