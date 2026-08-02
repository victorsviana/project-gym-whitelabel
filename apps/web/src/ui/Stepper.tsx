interface StepperProps {
  value: number;
  step: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

export function Stepper({ value, step, onChange, min, max, unit, formatValue }: StepperProps) {
  const clamp = (next: number) => {
    let clamped = next;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  const decrementDisabled = min !== undefined && value <= min;
  const incrementDisabled = max !== undefined && value >= max;
  const label = formatValue ? formatValue(value) : unit ? `${value} ${unit}` : String(value);

  return (
    <div className="border-border bg-input rounded-field flex items-center gap-3 border p-2">
      <button
        type="button"
        aria-label="Diminuir"
        disabled={decrementDisabled}
        onClick={() => onChange(clamp(value - step))}
        className="bg-surface-2 text-fg focus-visible:ring-brand/50 rounded-icon flex size-9 shrink-0 cursor-pointer items-center justify-center text-xl leading-none font-bold focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span className="font-display flex-1 text-center text-xl font-extrabold tabular-nums">
        {label}
      </span>
      <button
        type="button"
        aria-label="Aumentar"
        disabled={incrementDisabled}
        onClick={() => onChange(clamp(value + step))}
        className="bg-surface-2 text-fg focus-visible:ring-brand/50 rounded-icon flex size-9 shrink-0 cursor-pointer items-center justify-center text-xl leading-none font-bold focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
