import type { IsoDate } from '@gym/core';
import { parseIsoDate } from '@gym/core';

const SHORT_MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/** `1 ago`, como CONVENTIONS.md#formatação-de-dados-na-interface pede para data curta. */
export function formatShortDate(date: IsoDate): string {
  const { month, day } = parseIsoDate(date);
  return `${day} ${SHORT_MONTHS[month - 1]}`;
}
