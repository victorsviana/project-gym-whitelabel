import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Chip, TextField } from '../../ui/index.ts';
import { login, loginAsUser, type LoginMatch } from './actions';
import { AUDIENCES, type Audience } from './audiences';
import { useSessionStore } from './use-session';

export function LoginScreen() {
  const { audience } = useParams<{ audience: string }>();
  const navigate = useNavigate();
  const startSession = useSessionStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ambiguousMatches, setAmbiguousMatches] = useState<LoginMatch[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!audience || !(audience in AUDIENCES)) {
    return <Navigate to="/" replace />;
  }
  const config = AUDIENCES[audience as Audience];

  const enterWith = (match: LoginMatch) => {
    startSession(loginAsUser(match.user));
    navigate(config.homePath);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setAmbiguousMatches(null);
    setSubmitting(true);
    try {
      const result = await login(email, password, config.role);
      if (result.status === 'success') {
        startSession(result.session);
        navigate(config.homePath);
      } else if (result.status === 'ambiguous') {
        setAmbiguousMatches(result.matches);
      } else {
        setError('E-mail ou senha inválidos.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10">
      <header>
        <Link to="/" className="text-subtle text-sm font-semibold">
          ← Voltar
        </Link>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
          Entrar como {config.label}
        </h1>
      </header>

      {ambiguousMatches ? (
        <Card elevated className="flex flex-col gap-3">
          <p className="text-sm font-semibold">
            Esse e-mail existe em mais de uma academia. Escolha a sua conta:
          </p>
          <div className="flex flex-col gap-2">
            {ambiguousMatches.map((match) => (
              <Button key={match.gym.id} variant="secondary" onClick={() => enterWith(match)}>
                {match.gym.name}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      )}

      <p className="text-subtle text-center text-sm">
        Ainda não tem conta?{' '}
        <Link to={config.signupPath} className="text-brand font-semibold underline">
          Cadastre-se
        </Link>
      </p>

      {import.meta.env.DEV ? (
        <Chip className="self-center" onClick={() => navigate('/demo')}>
          Modo demo
        </Chip>
      ) : null}
    </div>
  );
}
