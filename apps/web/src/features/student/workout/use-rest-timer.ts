import { useEffect, useRef, useState } from 'react';

export const REST_PRESETS_SEC = [60, 90, 120] as const;

/** Alerta visual quando o descanso está nos últimos 10 s (UI-SPEC.md#detalhe-do-treino). */
export const REST_ALERT_THRESHOLD_SEC = 10;

export interface RestTimer {
  remainingSec: number;
  running: boolean;
  /** Predefinição ativa (60/90/120), só enquanto contando — null quando parado. */
  activePreset: number | null;
  start: (seconds: number) => void;
}

/** Mesma estratégia de `useStopwatch`: um alvo em `Date.now()`, não um contador decrescente por tique. */
export function useRestTimer(): RestTimer {
  const [preset, setPreset] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);
  const endAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const endAt = endAtRef.current;
      if (endAt === null) return;
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemainingSec(next);
      if (next === 0) setRunning(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const start = (seconds: number) => {
    endAtRef.current = Date.now() + seconds * 1000;
    setPreset(seconds);
    setRemainingSec(seconds);
    setRunning(true);
  };

  return { remainingSec, running, activePreset: running ? preset : null, start };
}
