/** Data de negócio no formato local `YYYY-MM-DD`, sem horário e sem fuso. */
export type IsoDate = string;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): value is IsoDate {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const { year, month, day } = parseIsoDate(value);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function toIsoDate(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Data de hoje pelo relógio local do dispositivo — nunca UTC. */
export function todayIsoDate(reference: Date = new Date()): IsoDate {
  return toIsoDate(reference);
}

export function parseIsoDate(date: IsoDate): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

export function addDays(date: IsoDate, amount: number): IsoDate {
  const { year, month, day } = parseIsoDate(date);
  const next = new Date(year, month - 1, day);
  next.setDate(next.getDate() + amount);
  return toIsoDate(next);
}

/** Comparação de strings — só é correta porque o formato tem zero à esquerda. */
export function compareIsoDate(a: IsoDate, b: IsoDate): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function isSameMonth(a: IsoDate, b: IsoDate): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Dias corridos entre duas datas locais — positivo quando `to` é depois de `from`. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const { year: fromYear, month: fromMonth, day: fromDay } = parseIsoDate(from);
  const { year: toYear, month: toMonth, day: toDay } = parseIsoDate(to);
  const fromMs = new Date(fromYear, fromMonth - 1, fromDay).getTime();
  const toMs = new Date(toYear, toMonth - 1, toDay).getTime();
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}
