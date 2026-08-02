import type { Gym, User } from '@gym/core';
import { useEffect, useState } from 'react';
import { gymRepository, userRepository } from '../../storage';
import { applyGymTheme } from './apply-gym-theme';
import { useSessionStore } from './use-session';

interface SessionAccount {
  loading: boolean;
  user: User | null;
  gym: Gym | null;
}

interface LoadedAccount {
  userId: string;
  user: User;
  gym: Gym;
}

/** Carrega usuário + academia da sessão ativa e aplica o tema da academia (ADR-0003). */
export function useSessionAccount(): SessionAccount {
  const session = useSessionStore((state) => state.session);
  const [account, setAccount] = useState<LoadedAccount | null>(null);

  useEffect(() => {
    if (!session) return;
    const activeSession = session;
    let cancelled = false;

    async function load() {
      const [user, gym] = await Promise.all([
        userRepository.findById(activeSession.gymId, activeSession.userId),
        gymRepository.findById(activeSession.gymId),
      ]);
      if (cancelled || !user || !gym) return;
      applyGymTheme(gym);
      setAccount({ userId: activeSession.userId, user, gym });
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) return { loading: false, user: null, gym: null };
  if (!account || account.userId !== session.userId) return { loading: true, user: null, gym: null };
  return { loading: false, user: account.user, gym: account.gym };
}
