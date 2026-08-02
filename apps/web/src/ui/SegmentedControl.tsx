interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="bg-surface-2 inline-flex gap-1 rounded-full p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={[
              'font-display min-h-11 min-w-16 cursor-pointer rounded-full px-4 text-sm font-bold tracking-wide uppercase transition-colors',
              'focus-visible:ring-brand/50 focus-visible:ring-2 focus-visible:outline-none',
              selected ? 'bg-brand text-brand-fg' : 'text-muted',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
