function baseSlug(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'academia'
  );
}

/** Gera um slug único checando colisão com `isTaken` (ex.: contra as academias já salvas). */
export function slugify(name: string, isTaken: (candidate: string) => boolean): string {
  const base = baseSlug(name);
  if (!isTaken(base)) return base;

  let suffix = 2;
  while (isTaken(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}
