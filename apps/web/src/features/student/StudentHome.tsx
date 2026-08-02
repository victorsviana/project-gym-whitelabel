import type { StudentProfile } from '@gym/core';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { studentRepository } from '../../storage';
import { useSessionAccount } from '../auth/use-session-account';
import { useSessionStore } from '../auth/use-session';
import { Button, Card } from '../../ui/index.ts';

export function StudentHome() {
  const { user, gym, loading } = useSessionAccount();
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!user || !gym) return;
    let cancelled = false;
    studentRepository.findProfile(gym.id, user.id).then((found) => {
      if (!cancelled) setProfile(found);
    });
    return () => {
      cancelled = true;
    };
  }, [user, gym]);

  if (loading || profile === undefined) return null;
  // onboardedAt null (nenhum StudentProfile ainda) é o sinal de onboarding pendente (F1-E06, F1-E08).
  if (!profile) return <Navigate to="/aluno/onboarding" replace />;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-brand font-display text-sm font-bold tracking-widest uppercase">
            {gym?.name}
          </p>
          <h1 className="font-display text-2xl font-extrabold tracking-wide uppercase">
            Olá, {user?.name.split(' ')[0]}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Sair
        </Button>
      </header>

      <Card elevated>
        <p className="font-display text-lg font-bold uppercase">Área do aluno</p>
        <p className="text-subtle mt-1 text-sm">
          Treino do dia, dieta e progresso chegam nos próximos épicos (F1-E09 a F1-E12).
        </p>
      </Card>
    </div>
  );
}
