import type { Gym } from '@gym/core';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gymRepository } from '../../storage';
import { Button, Chip, SegmentedControl, TextField } from '../../ui/index.ts';
import { registerTrainer } from './actions';
import { AUDIENCES } from './audiences';
import { BRAND_PRESETS } from './brand-presets';
import { useSessionStore } from './use-session';
import { isValidEmail, isValidPassword } from './validators';

type Mode = 'join' | 'create';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

export function TrainerSignupScreen() {
  const navigate = useNavigate();
  const startSession = useSessionStore((state) => state.login);

  const [mode, setMode] = useState<Mode>('join');
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymName, setGymName] = useState('');
  const [brandIndex, setBrandIndex] = useState(0);
  const [logo, setLogo] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    gymRepository.list().then(setGyms);
  }, []);

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogo(await readFileAsDataUrl(file));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Informe seu nome.';
    if (!isValidEmail(email)) nextErrors.email = 'E-mail inválido.';
    if (!isValidPassword(password)) nextErrors.password = 'A senha precisa de ao menos 8 caracteres.';
    if (mode === 'join' && !gymId) nextErrors.gym = 'Escolha a academia.';
    if (mode === 'create' && !gymName.trim()) nextErrors.gymName = 'Informe o nome da academia.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const preset = BRAND_PRESETS[brandIndex];
      const result = await registerTrainer(
        mode === 'join'
          ? { mode: 'join', name, email, password, gymId: gymId! }
          : {
              mode: 'create',
              name,
              email,
              password,
              gymName,
              brand: preset.brand,
              brandFg: preset.brandFg,
              logo,
            },
      );
      if (result.status === 'email_taken') {
        setErrors({ email: 'Esse e-mail já está cadastrado nessa academia.' });
        return;
      }
      startSession(result.session);
      navigate(AUDIENCES.professor.homePath);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10">
      <header>
        <Link to={AUDIENCES.professor.loginPath} className="text-subtle text-sm font-semibold">
          ← Voltar
        </Link>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
          Cadastro de professor
        </h1>
      </header>

      <SegmentedControl
        aria-label="Academia"
        options={[
          { value: 'join', label: 'Entrar em existente' },
          { value: 'create', label: 'Criar academia' },
        ]}
        value={mode}
        onChange={setMode}
      />

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

        {mode === 'join' ? (
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
        ) : (
          <>
            <TextField
              label="Nome da academia"
              value={gymName}
              onChange={(event) => setGymName(event.target.value)}
              error={errors.gymName}
            />
            <div>
              <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
                Cor principal
              </p>
              <div className="flex flex-wrap gap-2">
                {BRAND_PRESETS.map((preset, index) => (
                  <Chip
                    key={preset.name}
                    selected={index === brandIndex}
                    onClick={() => setBrandIndex(index)}
                    style={{ borderColor: preset.brand }}
                  >
                    {preset.name}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="logo"
                className="text-subtle text-xs font-semibold tracking-widest uppercase"
              >
                Logo (opcional)
              </label>
              <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
            </div>
          </>
        )}

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Cadastrando…' : 'Criar conta'}
        </Button>
      </form>
    </div>
  );
}
