interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'border-border relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors',
        'focus-visible:ring-brand/50 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-surface-2',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block size-5 translate-x-1 rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}
