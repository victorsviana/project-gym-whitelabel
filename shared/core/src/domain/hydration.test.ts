import { describe, expect, it } from 'vitest';
import { addWaterCup, computeFilledCups, computeTotalCups, removeWaterCup } from './hydration';

describe('addWaterCup', () => {
  it('soma 250ml', () => {
    expect(addWaterCup(500, 3250)).toBe(750);
  });

  it('não ultrapassa a meta', () => {
    expect(addWaterCup(3200, 3250)).toBe(3250);
  });
});

describe('removeWaterCup', () => {
  it('subtrai 250ml', () => {
    expect(removeWaterCup(500)).toBe(250);
  });

  it('não fica negativo', () => {
    expect(removeWaterCup(100)).toBe(0);
  });
});

describe('computeTotalCups / computeFilledCups', () => {
  it('conta copos totais e cheios', () => {
    expect(computeTotalCups(3250)).toBe(13);
    expect(computeFilledCups(750)).toBe(3);
  });
});
