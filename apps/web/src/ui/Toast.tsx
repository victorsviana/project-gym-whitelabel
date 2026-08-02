import { useEffect } from 'react';

const TOAST_DURATION_MS = 2200;

type ToastVariant = 'default' | 'success' | 'error';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  default: 'bg-sheet border-border text-fg',
  success: 'bg-sheet border-success/40 text-success',
  error: 'bg-sheet border-protein/40 text-protein',
};

export function Toast({ message, variant = 'default', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'animate-toast rounded-field pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 border px-5 py-3 text-sm font-semibold shadow-lg',
        VARIANT_CLASSES[variant],
      ].join(' ')}
    >
      {message}
    </div>
  );
}
