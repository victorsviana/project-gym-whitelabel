import { Link } from 'react-router-dom';
import { Button, Card } from '../../ui/index.ts';
import { AUDIENCES } from './audiences';

export function ProfileSelectScreen() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-5 py-10">
      <header className="text-center">
        <p className="text-brand font-display text-sm font-bold tracking-widest uppercase">
          Academia Whitelabel
        </p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-wide uppercase">
          Quem é você?
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <Card elevated className="flex flex-col gap-3">
          <p className="font-display text-xl font-bold uppercase">Sou aluno</p>
          <p className="text-subtle text-sm">Vejo meu treino, registro séries, carga e dieta.</p>
          <Link to={AUDIENCES.aluno.loginPath}>
            <Button fullWidth>Entrar como aluno</Button>
          </Link>
        </Card>

        <Card elevated className="flex flex-col gap-3">
          <p className="font-display text-xl font-bold uppercase">Sou academia / professor</p>
          <p className="text-subtle text-sm">Cadastro alunos, monto e atribuo treinos.</p>
          <Link to={AUDIENCES.professor.loginPath}>
            <Button fullWidth variant="secondary">
              Entrar como professor
            </Button>
          </Link>
        </Card>
      </div>

      {import.meta.env.DEV ? (
        <Link to="/demo" className="text-muted text-center text-sm font-semibold underline">
          Modo demo — entrar com uma conta pronta
        </Link>
      ) : null}
    </div>
  );
}
