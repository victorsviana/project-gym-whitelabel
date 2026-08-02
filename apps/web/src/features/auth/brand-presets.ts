/**
 * Presets prontos para a academia nova nascer com uma marca legível, sem precisar do cálculo de
 * contraste (luminância → sugestão automática) que é escopo do F1-E07, em `@gym/core/theme`.
 */
export interface BrandPreset {
  name: string;
  brand: string;
  brandFg: string;
}

export const BRAND_PRESETS: readonly BrandPreset[] = [
  { name: 'Vermelho', brand: '#E4022E', brandFg: '#FFFFFF' },
  { name: 'Azul', brand: '#2E7BFF', brandFg: '#FFFFFF' },
  { name: 'Laranja', brand: '#FF6B2C', brandFg: '#0A0B0A' },
  { name: 'Verde', brand: '#1E9E5A', brandFg: '#FFFFFF' },
  { name: 'Roxo', brand: '#7C3AED', brandFg: '#FFFFFF' },
];
