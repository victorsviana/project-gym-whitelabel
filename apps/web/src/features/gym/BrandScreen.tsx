import type { Gym, GymTheme } from '@gym/core';
import { contrastRatio, meetsContrastAA, relativeLuminance, suggestContrastColor } from '@gym/core';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymRepository } from '../../storage';
import { Button, Card, Chip, SegmentedControl, TextField } from '../../ui/index.ts';
import { applyThemeVars } from '../auth/apply-gym-theme';
import { BRAND_PRESETS } from '../auth/brand-presets';
import { useSessionAccount } from '../auth/use-session-account';
import { resizeLogo } from './resize-logo';

const CONTRAST_OPTIONS = [
  { value: '#FFFFFF', label: 'Branco' },
  { value: '#000000', label: 'Preto' },
] as const;

const MODE_OPTIONS = [
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' },
] as const;

function formatRatio(ratio: number): string {
  return ratio.toFixed(1).replace('.', ',');
}

export function BrandScreen() {
  const navigate = useNavigate();
  const { gym, loading } = useSessionAccount();

  const [draft, setDraft] = useState<Gym | null>(null);
  const [loadedGymId, setLoadedGymId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  if (gym && gym.id !== loadedGymId) {
    setDraft(gym);
    setLoadedGymId(gym.id);
  }

  useEffect(() => {
    if (draft) applyThemeVars(draft.theme);
  }, [draft]);

  if (loading || !draft) return null;

  const updateTheme = (patch: Partial<GymTheme>) => {
    setDraft((current) => (current ? { ...current, theme: { ...current.theme, ...patch } } : current));
  };

  const handlePresetSelect = (brand: string, brandFg: string) => {
    updateTheme({ brand, brandFg });
  };

  const handleCustomBrandChange = (event: ChangeEvent<HTMLInputElement>) => {
    const brand = event.target.value;
    updateTheme({ brand, brandFg: suggestContrastColor(brand) });
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const logo = await resizeLogo(file);
    setDraft((current) => (current ? { ...current, logo } : current));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setNameError('Informe o nome da academia.');
      return;
    }
    setNameError(undefined);
    setSaving(true);
    try {
      await gymRepository.save(draft);
      navigate('/gym');
    } finally {
      setSaving(false);
    }
  };

  const contrastValue = relativeLuminance(draft.theme.brandFg) >= 0.5 ? '#FFFFFF' : '#000000';
  const ratio = contrastRatio(draft.theme.brand, draft.theme.brandFg);
  const contrastOk = meetsContrastAA(draft.theme.brand, draft.theme.brandFg);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10">
      <header>
        <button
          type="button"
          onClick={() => navigate('/gym')}
          className="text-subtle text-sm font-semibold"
        >
          ← Voltar
        </button>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
          Identidade visual
        </h1>
      </header>

      <Card highlight elevated className="flex flex-col items-center gap-3 border-brand/25 py-6">
        <div className="bg-brand text-brand-fg flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl font-extrabold">
          {draft.logo ? (
            <img src={draft.logo} alt="" className="h-full w-full object-cover" />
          ) : (
            draft.initials
          )}
        </div>
        <p className="text-subtle text-xs font-semibold tracking-widest uppercase">Preview ao vivo</p>
        <Button variant="primary" size="sm">
          Iniciar treino
        </Button>
      </Card>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextField
          label="Nome da academia"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          error={nameError}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="logo" className="text-subtle text-xs font-semibold tracking-widest uppercase">
            Logo
          </label>
          <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
        </div>

        <div>
          <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">Cor principal</p>
          <div className="flex flex-wrap items-center gap-2">
            {BRAND_PRESETS.map((preset) => (
              <Chip
                key={preset.name}
                selected={preset.brand === draft.theme.brand && preset.brandFg === draft.theme.brandFg}
                onClick={() => handlePresetSelect(preset.brand, preset.brandFg)}
                style={{ borderColor: preset.brand }}
              >
                {preset.name}
              </Chip>
            ))}
            <input
              type="color"
              aria-label="Cor principal personalizada"
              value={draft.theme.brand}
              onChange={handleCustomBrandChange}
              className="border-border h-11 w-11 cursor-pointer rounded-full border bg-transparent"
            />
          </div>
        </div>

        <div>
          <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
            Cor de contraste
          </p>
          <SegmentedControl
            aria-label="Cor de contraste"
            options={CONTRAST_OPTIONS}
            value={contrastValue}
            onChange={(value) => updateTheme({ brandFg: value })}
          />
          {!contrastOk ? (
            <p role="alert" className="text-protein mt-2 text-sm font-semibold">
              Contraste de {formatRatio(ratio)}:1 — abaixo do mínimo recomendado de 4,5:1.
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
            Tema padrão
          </p>
          <SegmentedControl
            aria-label="Tema padrão"
            options={MODE_OPTIONS}
            value={draft.theme.mode}
            onChange={(value) => updateTheme({ mode: value })}
          />
        </div>

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar identidade visual'}
        </Button>
      </form>
    </div>
  );
}
