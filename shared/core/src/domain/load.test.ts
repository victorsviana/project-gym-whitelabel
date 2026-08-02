import { describe, expect, it } from 'vitest';
import { computeLoadDelta, decreaseLoad, increaseLoad, suggestInitialLoad } from './load';

describe('increaseLoad / decreaseLoad', () => {
  it('ajusta em 2,5kg', () => {
    expect(increaseLoad(20)).toBe(22.5);
    expect(decreaseLoad(22.5)).toBe(20);
  });

  it('não passa de 500kg', () => {
    expect(increaseLoad(499)).toBe(500);
  });

  it('não fica negativo', () => {
    expect(decreaseLoad(1)).toBe(0);
  });

  it('arredonda para o meio quilo mais próximo', () => {
    expect(increaseLoad(20.2)).toBe(22.5);
    expect(increaseLoad(20.3)).toBe(23);
  });
});

describe('suggestInitialLoad', () => {
  it('usa a última carga registrada', () => {
    expect(suggestInitialLoad(35)).toBe(35);
  });

  it('sugere 20kg sem histórico', () => {
    expect(suggestInitialLoad(null)).toBe(20);
  });
});

describe('computeLoadDelta', () => {
  it('calcula a diferença entre a última e a primeira carga', () => {
    expect(computeLoadDelta([20, 22.5, 25, 27.5])).toBe(7.5);
  });

  it('é negativo quando a carga caiu', () => {
    expect(computeLoadDelta([30, 25])).toBe(-5);
  });

  it('é 0 sem histórico suficiente', () => {
    expect(computeLoadDelta([20])).toBe(0);
    expect(computeLoadDelta([])).toBe(0);
  });
});
