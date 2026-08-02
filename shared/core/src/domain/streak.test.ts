import { describe, expect, it } from 'vitest';
import { computeStreak, countActiveDaysInMonth, isActiveDay } from './streak';

describe('isActiveDay', () => {
  it('é ativo com pelo menos uma série ou uma refeição', () => {
    expect(isActiveDay(true, false)).toBe(true);
    expect(isActiveDay(false, true)).toBe(true);
  });

  it('não é ativo sem nenhuma atividade — abrir o app não conta', () => {
    expect(isActiveDay(false, false)).toBe(false);
  });
});

describe('computeStreak', () => {
  it('conta dias ativos consecutivos até hoje', () => {
    const activeDates = new Set(['2026-07-30', '2026-07-31', '2026-08-01']);
    expect(computeStreak(activeDates, '2026-08-01')).toBe(3);
  });

  it('para no primeiro dia inativo', () => {
    const activeDates = new Set(['2026-07-31', '2026-08-01']);
    expect(computeStreak(activeDates, '2026-08-01')).toBe(2);

    const withGap = new Set(['2026-07-29', '2026-08-01']);
    expect(computeStreak(withGap, '2026-08-01')).toBe(1);
  });

  it('é 0 quando hoje ainda não está ativo, mesmo com histórico antes', () => {
    const activeDates = new Set(['2026-07-30', '2026-07-31']);
    expect(computeStreak(activeDates, '2026-08-01')).toBe(0);
  });
});

describe('countActiveDaysInMonth', () => {
  it('conta só os dias do mês de referência', () => {
    const activeDates = new Set(['2026-07-31', '2026-08-01', '2026-08-15']);
    expect(countActiveDaysInMonth(activeDates, '2026-08-01')).toBe(2);
  });
});
