import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-subtle text-xs font-semibold tracking-widest uppercase">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'bg-input border-border text-fg rounded-field min-h-11 border px-4 py-2 text-base',
          'focus-visible:ring-brand/50 focus-visible:ring-2 focus-visible:outline-none',
          error ? 'border-protein' : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-protein text-sm font-semibold">
          {error}
        </p>
      ) : null}
    </div>
  );
}
