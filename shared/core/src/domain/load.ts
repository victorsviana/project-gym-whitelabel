export const LOAD_STEP_KG = 2.5;
const LOAD_MIN_KG = 0;
const LOAD_MAX_KG = 500;
const DEFAULT_INITIAL_LOAD_KG = 20;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Arredonda para o meio quilo mais próximo, limitado a [0, 500]. */
function adjustLoad(current: number, delta: number): number {
  const rounded = Math.round((current + delta) * 2) / 2;
  return clamp(rounded, LOAD_MIN_KG, LOAD_MAX_KG);
}

export function increaseLoad(current: number): number {
  return adjustLoad(current, LOAD_STEP_KG);
}

export function decreaseLoad(current: number): number {
  return adjustLoad(current, -LOAD_STEP_KG);
}

/** A última carga registrada naquele exercício; sem histórico, 20 kg. */
export function suggestInitialLoad(lastLoggedWeight: number | null): number {
  return lastLoggedWeight ?? DEFAULT_INITIAL_LOAD_KG;
}

/** loadsByDateAsc: cargas ordenadas da mais antiga para a mais recente. */
export function computeLoadDelta(loadsByDateAsc: readonly number[]): number {
  if (loadsByDateAsc.length < 2) return 0;
  const first = loadsByDateAsc[0];
  const last = loadsByDateAsc[loadsByDateAsc.length - 1];
  return last - first;
}
