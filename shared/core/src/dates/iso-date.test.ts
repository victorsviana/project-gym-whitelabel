import { describe, expect, it } from 'vitest';
import { addDays, compareIsoDate, isSameMonth, isValidIsoDate, toIsoDate } from './iso-date';

describe('toIsoDate', () => {
  it('formata com zero à esquerda', () => {
    expect(toIsoDate(new Date(2026, 7, 1))).toBe('2026-08-01');
    expect(toIsoDate(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('isValidIsoDate', () => {
  it('aceita datas válidas no formato YYYY-MM-DD', () => {
    expect(isValidIsoDate('2026-08-01')).toBe(true);
  });

  it('rejeita formato sem zero à esquerda', () => {
    expect(isValidIsoDate('2026-8-1')).toBe(false);
  });

  it('rejeita datas inexistentes', () => {
    expect(isValidIsoDate('2026-02-30')).toBe(false);
  });
});

describe('addDays', () => {
  it('soma dias dentro do mesmo mês', () => {
    expect(addDays('2026-08-01', 8)).toBe('2026-08-09');
  });

  it('atravessa a virada de mês', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('subtrai dias', () => {
    expect(addDays('2026-08-01', -1)).toBe('2026-07-31');
  });
});

describe('compareIsoDate', () => {
  it('ordena corretamente datas com dois dígitos, ao contrário de string sem zero', () => {
    const dates = ['2026-8-10', '2026-8-9'];
    expect(dates.sort()).toEqual(['2026-8-10', '2026-8-9']);

    const isoDates = ['2026-08-10', '2026-08-09'];
    expect([...isoDates].sort(compareIsoDate)).toEqual(['2026-08-09', '2026-08-10']);
  });
});

describe('isSameMonth', () => {
  it('compara ano e mês, ignorando o dia', () => {
    expect(isSameMonth('2026-08-01', '2026-08-31')).toBe(true);
    expect(isSameMonth('2026-08-31', '2026-09-01')).toBe(false);
  });
});
