import type { Gym } from '@gym/core';
import { describe, expect, it } from 'vitest';
import { buildGymManifest } from './build-manifest';

const icons = {
  icon192: 'data:image/png;base64,AAA',
  icon512: 'data:image/png;base64,BBB',
  icon512Maskable: 'data:image/png;base64,CCC',
  appleTouchIcon: 'data:image/png;base64,DDD',
};

function makeGym(overrides: Partial<Gym> = {}): Gym {
  return {
    id: 'gym-1',
    name: 'Gaviões Fitness',
    slug: 'gavioes-fitness',
    initials: 'GF',
    logo: null,
    theme: { brand: '#E4022E', brandFg: '#FFFFFF', mode: 'dark' },
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildGymManifest', () => {
  it('usa nome, cor de marca e cor de fundo da academia', () => {
    const manifest = buildGymManifest(makeGym({ name: 'Bluefit' }), icons, '#0a0b0a');

    expect(manifest.name).toBe('Bluefit');
    expect(manifest.short_name).toBe('Bluefit');
    expect(manifest.theme_color).toBe('#E4022E');
    expect(manifest.background_color).toBe('#0a0b0a');
    expect(manifest.display).toBe('standalone');
  });

  it('usa as iniciais como short_name quando o nome é longo (limite do manifest)', () => {
    const manifest = buildGymManifest(makeGym({ name: 'Gaviões Fitness' }), icons, '#0a0b0a');

    expect(manifest.short_name).toBe('GF');
  });

  it('inclui os três ícones com o purpose certo, cada um', () => {
    const manifest = buildGymManifest(makeGym(), icons, '#0a0b0a');

    expect(manifest.icons).toEqual([
      { src: icons.icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icons.icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icons.icon512Maskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ]);
  });
});
