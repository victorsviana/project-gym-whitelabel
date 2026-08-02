import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

export function Chip({
  selected = false,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={[
        'min-h-11 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        'focus-visible:ring-brand/50 focus-visible:ring-2 focus-visible:outline-none',
        selected ? 'border-brand/25 bg-brand/16 text-brand' : 'border-border bg-surface-2 text-fg',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
