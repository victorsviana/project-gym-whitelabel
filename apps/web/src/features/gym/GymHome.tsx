import { useNavigate } from 'react-router-dom';
import { useSessionAccount } from '../auth/use-session-account';
import { useSessionStore } from '../auth/use-session';
import { Button, Card } from '../../ui/index.ts';

export function GymHome() {
  const { user, gym, loading } = useSessionAccount();
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();

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

      <Card elevated>
        <p className="font-display text-lg font-bold uppercase">Painel da academia</p>
        <p className="text-subtle mt-1 text-sm">
          Identidade visual, alunos, montagem e atribuição de treino chegam nos próximos épicos
          (F1-E07, F1-E13 e F1-E14).
        </p>
      </Card>
    </div>
  );
}
