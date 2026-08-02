import type { Gym, User } from '@gym/core';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { gymRepository, userRepository } from '../../storage';
import { Button, Card } from '../../ui/index.ts';
import { loginAsUser } from './actions';
import { homePathForRole } from './audiences';
import { useSessionStore } from './use-session';

interface GymAccounts {
  gym: Gym;
  users: User[];
}

const ROLE_LABEL: Record<User['role'], string> = {
  student: 'Aluno',
  trainer: 'Professor',
};

export function DemoModeScreen() {
  const navigate = useNavigate();
  const startSession = useSessionStore((state) => state.login);
  const [groups, setGroups] = useState<GymAccounts[] | null>(null);

  useEffect(() => {
    async function load() {
      const gyms = await gymRepository.list();
      const loaded = await Promise.all(
        gyms.map(async (gym) => ({ gym, users: await userRepository.listByGym(gym.id) })),
      );
      setGroups(loaded);
    }
    load();
  }, []);

  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  const enterWith = (user: User) => {
    startSession(loginAsUser(user));
    navigate(homePathForRole(user.role));
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-10">
      <header>
        <Link to="/" className="text-subtle text-sm font-semibold">
          ← Voltar
        </Link>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
          Modo demo
        </h1>
        <p className="text-subtle mt-1 text-sm">
          Entre em qualquer conta de demonstração com um toque, sem senha.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {groups?.map(({ gym, users }) => (
          <Card key={gym.id} elevated className="flex flex-col gap-3">
            <p className="font-display text-lg font-bold uppercase">{gym.name}</p>
            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant="secondary"
                  className="flex items-center justify-between normal-case"
                  onClick={() => enterWith(user)}
                >
                  <span>{user.name}</span>
                  <span className="text-subtle text-xs">{ROLE_LABEL[user.role]}</span>
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
