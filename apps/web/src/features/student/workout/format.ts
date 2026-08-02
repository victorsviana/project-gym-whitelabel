/** `04:32`, sempre com tabular nums (CONVENTIONS.md#formatação-de-dados-na-interface). */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** `22,5 kg` — vírgula decimal. */
export function formatLoadKg(kg: number): string {
  return `${kg.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kg`;
}

/** `+2,5 kg` / `-2,5 kg` / `0 kg`, com sinal (DOMAIN-RULES.md#73-evolução). */
export function formatLoadDelta(deltaKg: number): string {
  const sign = deltaKg > 0 ? '+' : '';
  return `${sign}${deltaKg.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kg`;
}
