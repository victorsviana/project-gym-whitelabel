import { describe, expect, it } from 'vitest';
import { createId } from './ids';

describe('createId', () => {
  it('gera ids não vazios', () => {
    expect(createId().length).toBeGreaterThan(0);
  });

  it('gera ids diferentes a cada chamada', () => {
    const ids = Array.from({ length: 100 }, () => createId());
    expect(new Set(ids).size).toBe(ids.length);
  });
});
