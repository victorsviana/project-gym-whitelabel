import type { Gym } from '@gym/core';
import { buildGymManifest, gymShortName } from './build-manifest';
import { generateGymIcons } from './generate-app-icon';

let activeManifestUrl: string | null = null;

function setLinkHref(id: string, href: string) {
  document.querySelector<HTMLLinkElement>(`#${id}`)?.setAttribute('href', href);
}

function setMetaContent(id: string, content: string) {
  document.querySelector<HTMLMetaElement>(`#${id}`)?.setAttribute('content', content);
}

/**
 * Sobrescreve o manifest/ícones/theme-color genéricos de `index.html` pelos da academia ativa, junto
 * com `applyThemeVars` (F1-E07) — mesmo padrão de "a academia repinta o app em runtime" do ADR-0003,
 * aplicado ao PWA (WHITELABEL.md#pwa-por-academia). O manifest vira um Blob local: nada de rede, então
 * funciona offline como o resto do app.
 */
export async function applyGymManifest(gym: Gym): Promise<void> {
  document.title = gym.name;
  setMetaContent('pwa-theme-color', gym.theme.brand);
  setMetaContent('pwa-apple-title', gymShortName(gym));

  const icons = await generateGymIcons(gym);
  if (!icons) return; // sem canvas 2D, fica só com o nome/cor trocados e o ícone genérico

  const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0a0b0a';
  const manifest = buildGymManifest(gym, icons, backgroundColor);

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
  const url = URL.createObjectURL(blob);
  document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.setAttribute('href', url);

  if (activeManifestUrl) URL.revokeObjectURL(activeManifestUrl);
  activeManifestUrl = url;

  setLinkHref('pwa-favicon', icons.icon192);
  setLinkHref('pwa-apple-touch-icon', icons.appleTouchIcon);
}
