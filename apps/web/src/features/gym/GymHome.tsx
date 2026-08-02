import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../ui/index.ts';
import { useSessionAccount } from '../auth/use-session-account';
import { useSessionStore } from '../auth/use-session';
import type { GymDashboard } from './students/load-students';
import { loadGymDashboard } from './students/load-students';

const INDICATORS: { key: keyof GymDashboard; label: string }[] = [
  { key: 'activeStudents', label: 'Alunos ativos' },
  { key: 'studentsWithoutPlan', label: 'Alunos sem treino' },
  { key: 'openNotices', label: 'Pendências abertas' },
  { key: 'publishedPlans', label: 'Treinos publicados' },
];

export function GymHome() {
  const { user, gym, loading } = useSessionAccount();
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<GymDashboard | null>(null);

  useEffect(() => {
    if (!gym) return;
    loadGymDashboard(gym.id).then(setDashboard);
  }, [gym]);

  if (loading) return null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-10">
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

      <div className="grid grid-cols-2 gap-3">
        {INDICATORS.map(({ key, label }) => (
          <Card key={key} elevated>
            <p className="font-display text-3xl font-extrabold">
              {dashboard ? dashboard[key] : '—'}
            </p>
            <p className="text-subtle mt-1 text-sm">{label}</p>
          </Card>
        ))}
      </div>

      <Card elevated className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold uppercase">Alunos</p>
          <p className="text-subtle mt-1 text-sm">
            Ficha, avaliação, situação e cadastro de cada aluno da academia.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/gym/alunos')}>
          Ver alunos
        </Button>
      </Card>

      <Card elevated className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold uppercase">Identidade visual</p>
          <p className="text-subtle mt-1 text-sm">Nome, logo, cor principal e cor de contraste.</p>
        </div>
        <Button size="sm" onClick={() => navigate('/gym/marca')}>
          Editar
        </Button>
      </Card>

      <Card elevated className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold uppercase">Treinos</p>
          <p className="text-subtle mt-1 text-sm">
            Montar planos, exercícios, atribuição a alunos e publicação.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/gym/treinos')}>
          Ver treinos
        </Button>
      </Card>
    </div>
  );
}
