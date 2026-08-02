import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="bg-scrim absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-sheet border-border rounded-sheet relative w-full max-w-md rounded-b-none border p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-xl font-extrabold tracking-wide uppercase">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="text-muted focus-visible:ring-brand/50 flex size-9 cursor-pointer items-center justify-center rounded-full text-xl focus-visible:ring-2 focus-visible:outline-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
