import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  meetsContrastAA,
  relativeLuminance,
  suggestContrastColor,
} from './theme';

describe('relativeLuminance', () => {
  it('preto é 0 e branco é 1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
  });
});

describe('contrastRatio', () => {
  it('preto contra branco é o máximo, 21:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('uma cor contra ela mesma é o mínimo, 1:1', () => {
    expect(contrastRatio('#E4022E', '#E4022E')).toBeCloseTo(1, 5);
  });

  it('é simétrica', () => {
    expect(contrastRatio('#2E7BFF', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#2E7BFF'), 10);
  });
});

// As três marcas de demonstração de WHITELABEL.md#marcas-de-demonstração — Bluefit é o caso
// deliberado de contraste ruim ("expor problemas de contraste... logo cedo"), então a sugestão
// da função diverge do branco que o seed usa de propósito.
describe('suggestContrastColor', () => {
  it('sugere branco para o vermelho da Gaviões Fitness', () => {
    expect(suggestContrastColor('#E4022E')).toBe('#FFFFFF');
  });

  it('sugere preto para o azul da Bluefit', () => {
    expect(suggestContrastColor('#2E7BFF')).toBe('#000000');
  });

  it('sugere preto para o laranja da Iron House', () => {
    expect(suggestContrastColor('#FF6B2C')).toBe('#000000');
  });
});

describe('meetsContrastAA', () => {
  it('vermelho da Gaviões com branco passa no AA', () => {
    expect(meetsContrastAA('#E4022E', '#FFFFFF')).toBe(true);
  });

  it('azul da Bluefit com branco não passa no AA (3,89:1)', () => {
    expect(meetsContrastAA('#2E7BFF', '#FFFFFF')).toBe(false);
  });

  it('azul da Bluefit com preto passa no AA', () => {
    expect(meetsContrastAA('#2E7BFF', '#000000')).toBe(true);
  });
});
