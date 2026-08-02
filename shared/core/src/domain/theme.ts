/** Mínimo de contraste AA do WCAG 2.x para texto normal. */
export const MIN_CONTRAST_AA = 4.5;

const SRGB_LOW_RANGE_THRESHOLD = 0.03928;
const SRGB_LOW_RANGE_DIVISOR = 12.92;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function linearizeChannel(channel8Bit: number): number {
  const channel = channel8Bit / 255;
  return channel <= SRGB_LOW_RANGE_THRESHOLD
    ? channel / SRGB_LOW_RANGE_DIVISOR
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** Luminância relativa (WCAG 2.x): 0 para preto, 1 para branco. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
}

/** Razão de contraste (WCAG 2.x) entre duas cores, sempre >= 1. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lighter = Math.max(relativeLuminance(hexA), relativeLuminance(hexB));
  const darker = Math.min(relativeLuminance(hexA), relativeLuminance(hexB));
  return (lighter + 0.05) / (darker + 0.05);
}

/** Sugere preto ou branco como cor de contraste para `brand` — o que tiver maior razão (WHITELABEL.md). */
export function suggestContrastColor(brand: string): '#000000' | '#FFFFFF' {
  return contrastRatio(brand, '#FFFFFF') >= contrastRatio(brand, '#000000') ? '#FFFFFF' : '#000000';
}

/** Não bloqueia a escolha do cliente — só informa se o par fica abaixo do mínimo AA (WHITELABEL.md). */
export function meetsContrastAA(hexA: string, hexB: string): boolean {
  return contrastRatio(hexA, hexB) >= MIN_CONTRAST_AA;
}
