import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'water';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-fg shadow-[0_8px_24px_rgb(var(--brand-rgb)/30%)]',
  secondary: 'bg-surface-2 text-fg border border-border',
  ghost: 'bg-transparent text-muted',
  /** Hidratação nunca usa a cor da marca — WHITELABEL.md#cores-fixas-do-sistema. */
  water: 'bg-water text-white',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-6 py-3 text-lg',
  sm: 'min-h-11 px-4 py-2 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'font-display rounded-field cursor-pointer font-bold tracking-wide uppercase transition-transform',
        'focus-visible:ring-brand/50 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
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
