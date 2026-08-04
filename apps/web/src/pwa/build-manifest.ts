import type { Gym } from '@gym/core';
import type { GymIconSet } from './generate-app-icon';

export interface GeneratedManifest {
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
}

const SHORT_NAME_MAX_LENGTH = 12;

export function gymShortName(gym: Gym): string {
  return gym.name.length > SHORT_NAME_MAX_LENGTH ? gym.initials : gym.name;
}

/**
 * Manifest da academia ativa — nome, ícone e cores dela, não do produto genérico
 * (docs/WHITELABEL.md#pwa-por-academia). `backgroundColor` vem do `--bg` computado no momento da
 * chamada, não duplicado aqui, para não hardcodar o valor de `styles/tokens.css` (AGENTS.md regra 4).
 */
export function buildGymManifest(gym: Gym, icons: GymIconSet, backgroundColor: string): GeneratedManifest {
  return {
    id: '/',
    name: gym.name,
    short_name: gymShortName(gym),
    description: `Treino e dieta da ${gym.name}.`,
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: backgroundColor,
    theme_color: gym.theme.brand,
    icons: [
      { src: icons.icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icons.icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icons.icon512Maskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
