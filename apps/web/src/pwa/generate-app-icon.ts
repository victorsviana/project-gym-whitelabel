import type { Gym } from '@gym/core';

export interface GymIconSet {
  icon192: string;
  icon512: string;
  icon512Maskable: string;
  appleTouchIcon: string;
}

function loadLogo(logo: string | null): Promise<HTMLImageElement | null> {
  if (!logo) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = logo;
  });
}

/**
 * Ícone com o logo da academia (contain, com margem) ou, sem logo, as iniciais sobre a cor principal —
 * mesmo fallback que o resto do app usa (WHITELABEL.md#logo). `safeZoneFrac` reserva margem para o
 * recorte do sistema operacional (ícone maskable do Android, cantos arredondados do iOS).
 */
function drawIcon(
  gym: Gym,
  size: number,
  safeZoneFrac: number,
  logoImage: HTMLImageElement | null,
): string | null {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = gym.theme.brand;
  context.fillRect(0, 0, size, size);

  const safeSize = size * safeZoneFrac;
  const offset = (size - safeSize) / 2;

  if (logoImage) {
    const scale = Math.min(safeSize / logoImage.width, safeSize / logoImage.height);
    const width = logoImage.width * scale;
    const height = logoImage.height * scale;
    context.drawImage(logoImage, offset + (safeSize - width) / 2, offset + (safeSize - height) / 2, width, height);
  } else {
    context.fillStyle = gym.theme.brandFg;
    context.font = `800 ${Math.round(safeSize * 0.42)}px 'Barlow Condensed', sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(gym.initials.slice(0, 2).toUpperCase(), size / 2, size / 2);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Gera o conjunto de ícones da academia ativa para o manifest e o apple-touch-icon
 * (docs/WHITELABEL.md#pwa-por-academia). `null` se o navegador não suportar canvas 2D — o app shell
 * (F1-E16) não pode depender disso pra funcionar, então quem chama fica com o fallback genérico.
 */
export async function generateGymIcons(gym: Gym): Promise<GymIconSet | null> {
  const logoImage = await loadLogo(gym.logo);
  const icon192 = drawIcon(gym, 192, 1, logoImage);
  const icon512 = drawIcon(gym, 512, 1, logoImage);
  const icon512Maskable = drawIcon(gym, 512, 0.72, logoImage);
  const appleTouchIcon = drawIcon(gym, 180, 0.82, logoImage);
  if (!icon192 || !icon512 || !icon512Maskable || !appleTouchIcon) return null;
  return { icon192, icon512, icon512Maskable, appleTouchIcon };
}
