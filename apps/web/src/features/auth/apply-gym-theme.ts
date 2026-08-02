import type { Gym } from '@gym/core';

function hexToRgbTriplet(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Escreve o tema da academia nas CSS vars do documento — mesma técnica do Showcase (ADR-0003). */
export function applyGymTheme(gym: Gym): void {
  document.documentElement.dataset.theme = gym.theme.mode;
  const root = document.documentElement.style;
  root.setProperty('--brand', gym.theme.brand);
  root.setProperty('--brand-rgb', hexToRgbTriplet(gym.theme.brand));
  root.setProperty('--brand-fg', gym.theme.brandFg);
}
