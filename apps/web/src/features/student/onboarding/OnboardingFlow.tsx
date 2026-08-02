import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionAccount } from '../../auth/use-session-account';
import { useSessionStore } from '../../auth/use-session';
import { AnalyzingScreen } from './AnalyzingScreen.tsx';
import { GoalsReadyScreen } from './GoalsReadyScreen.tsx';
import { OnboardingScreen } from './OnboardingScreen.tsx';
import { completeOnboarding } from './save-onboarding';
import { ONBOARDING_DEFAULTS, type OnboardingAnswers } from './types';

type OnboardingPhase = 'steps' | 'analyzing' | 'ready';

/** Orquestra os 7 passos, o processamento e a tela de metas prontas (F1-E08, UI-SPEC.md). */
export function OnboardingFlow() {
  const { user, gym, loading } = useSessionAccount();
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();

  const [phase, setPhase] = useState<OnboardingPhase>('steps');
  const [answers, setAnswers] = useState<OnboardingAnswers>(ONBOARDING_DEFAULTS);
  const saveRef = useRef<Promise<void> | null>(null);

  if (loading || !user || !gym) return null;

  const handleStepsComplete = (finalAnswers: OnboardingAnswers) => {
    setAnswers(finalAnswers);
    saveRef.current = completeOnboarding(gym.id, user.id, finalAnswers);
    setPhase('analyzing');
  };

  const handleAnalyzingDone = async () => {
    await saveRef.current;
    setPhase('ready');
  };

  const handleExit = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleEnter = () => {
    navigate('/aluno', { replace: true });
  };

  if (phase === 'analyzing') {
    return <AnalyzingScreen onDone={handleAnalyzingDone} />;
  }

  if (phase === 'ready') {
    return <GoalsReadyScreen answers={answers} gym={gym} onEnter={handleEnter} />;
  }

  return (
    <OnboardingScreen
      gymName={gym.name}
      initialAnswers={answers}
      onComplete={handleStepsComplete}
      onExit={handleExit}
    />
  );
}
