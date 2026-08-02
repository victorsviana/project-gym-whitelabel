import type { Gym } from '@gym/core';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gymRepository } from '../../storage';
import { Button, Chip, TextField } from '../../ui/index.ts';
import { registerStudent } from './actions';
import { AUDIENCES } from './audiences';
import { useSessionStore } from './use-session';
import { isValidEmail, isValidPassword } from './validators';

export function StudentSignupScreen() {
  const navigate = useNavigate();
  const startSession = useSessionStore((state) => state.login);

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    gymRepository.list().then(setGyms);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Informe seu nome.';
    if (!isValidEmail(email)) nextErrors.email = 'E-mail inválido.';
    if (!isValidPassword(password)) nextErrors.password = 'A senha precisa de ao menos 8 caracteres.';
    if (!gymId) nextErrors.gym = 'Escolha a sua academia.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !gymId) return;

    setSubmitting(true);
    try {
      const result = await registerStudent({ name, email, password, gymId });
      if (result.status === 'email_taken') {
        setErrors({ email: 'Esse e-mail já está cadastrado nessa academia.' });
        return;
      }
      startSession(result.session);
      navigate(AUDIENCES.aluno.homePath);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10">
      <header>
        <Link to={AUDIENCES.aluno.loginPath} className="text-subtle text-sm font-semibold">
          ← Voltar
        </Link>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
          Cadastro de aluno
        </h1>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Nome"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <div>
          <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Academia</p>
          <div className="flex flex-wrap gap-2">
            {gyms.map((gym) => (
              <Chip key={gym.id} selected={gym.id === gymId} onClick={() => setGymId(gym.id)}>
                {gym.name}
              </Chip>
            ))}
          </div>
          {errors.gym ? <p className="text-protein mt-2 text-sm font-semibold">{errors.gym}</p> : null}
        </div>

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Cadastrando…' : 'Criar conta'}
        </Button>
      </form>
    </div>
  );
}
