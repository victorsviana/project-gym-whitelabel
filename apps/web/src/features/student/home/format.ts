import type { IsoDate } from '@gym/core';
import { parseIsoDate } from '@gym/core';

const WEEKDAY_NAMES = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const LONG_MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function toLocalDate(date: IsoDate): Date {
  const { year, month, day } = parseIsoDate(date);
  return new Date(year, month - 1, day);
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Sábado, 2 de agosto", para o cabeçalho da Home. */
export function formatGreetDate(date: IsoDate): string {
  const { day } = parseIsoDate(date);
  const weekday = WEEKDAY_NAMES[toLocalDate(date).getDay()];
  const month = LONG_MONTHS[parseIsoDate(date).month - 1];
  return capitalizeFirst(`${weekday}, ${day} de ${month}`);
}

/** "Agosto de 2026", para o cabeçalho do calendário de constância. */
export function formatCalendarMonth(date: IsoDate): string {
  const { year, month } = parseIsoDate(date);
  return capitalizeFirst(`${LONG_MONTHS[month - 1]} de ${year}`);
}

/** Data por extenso do extrato do dia, ex.: "sábado, 2 de agosto de 2026". */
export function formatFullDate(date: IsoDate): string {
  const { year } = parseIsoDate(date);
  return `${formatGreetDate(date)} de ${year}`;
}
