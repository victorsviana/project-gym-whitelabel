interface LetterBadgeProps {
  letter: string;
  size?: 'sm' | 'md';
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'size-8 text-sm',
  md: 'size-11 text-lg',
};

/** Selo colorido com a letra do plano ("A", "B"...) — sempre ao lado do nome, nunca só texto solto. */
export function LetterBadge({ letter, size = 'md' }: LetterBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={`bg-brand text-brand-fg font-display flex shrink-0 items-center justify-center rounded-icon font-extrabold ${SIZE_CLASSES[size]}`}
    >
      {letter}
    </span>
  );
}
