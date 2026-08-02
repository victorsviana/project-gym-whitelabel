import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  highlight?: boolean;
  children: ReactNode;
}

export function Card({
  elevated = false,
  highlight = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'border-border border p-4',
        highlight ? 'rounded-card-lg' : 'rounded-card',
        elevated ? 'bg-surface-2' : 'bg-surface',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
