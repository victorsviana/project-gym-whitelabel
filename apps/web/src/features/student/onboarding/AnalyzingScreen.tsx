import { useEffect, useState } from 'react';
import { Ring } from '../../../ui/index.ts';
import { ANALYZING_MESSAGES } from './copy';

/** Passos fixos (não aleatórios, ao contrário do protótipo) para o "teatro" ficar testável. */
const STEP_DURATION_MS = 480;
const FINISH_DELAY_MS = 400;

interface AnalyzingScreenProps {
  onDone: () => void;
}

/** Tela de processamento — anel com percentual e mensagens em sequência (~2s, UI-SPEC.md). */
export function AnalyzingScreen({ onDone }: AnalyzingScreenProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= ANALYZING_MESSAGES.length) {
      const finishTimer = setTimeout(onDone, FINISH_DELAY_MS);
      return () => clearTimeout(finishTimer);
    }
    const stepTimer = setTimeout(() => setStep((current) => current + 1), STEP_DURATION_MS);
    return () => clearTimeout(stepTimer);
  }, [step, onDone]);

  const percent = Math.min(100, Math.round((step / ANALYZING_MESSAGES.length) * 100));
  const message = ANALYZING_MESSAGES[Math.min(step, ANALYZING_MESSAGES.length - 1)];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
      <Ring value={percent}>
        <span className="font-display text-4xl font-extrabold tabular-nums">{percent}</span>
      </Ring>
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-wide uppercase">
          Montando seu perfil
        </h1>
        <p className="text-subtle mt-2 min-h-6 text-base">{message}</p>
      </div>
    </div>
  );
}
