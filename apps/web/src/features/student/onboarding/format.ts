/** "2847" -> "2.847 kcal" (CONVENTIONS.md#formatação-de-dados-na-interface). */
export function formatKcal(kcal: number): string {
  return `${kcal.toLocaleString('pt-BR')} kcal`;
}

/** Água em ml -> litros com vírgula decimal, ex.: 3250 -> "3,3L". */
export function formatWaterLiters(waterMl: number): string {
  const liters = waterMl / 1000;
  return `${liters.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}L`;
}

/** "+10% superávit" / "18% déficit" / "manutenção", a partir do ajuste percentual do objetivo. */
export function formatKcalAdjustment(adjustmentPct: number): string {
  if (adjustmentPct > 0) return `+${adjustmentPct}% superávit`;
  if (adjustmentPct < 0) return `${adjustmentPct}% déficit`;
  return 'manutenção';
}
