interface OnboardingOptionProps {
  label: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}

/** Botão de lista para as escolhas do onboarding (sexo, objetivo, nível, lesões, restrições). */
export function OnboardingOption({ label, subtitle, selected, onClick }: OnboardingOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        'rounded-card flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border p-4 text-left transition-colors',
        'focus-visible:ring-brand/50 focus-visible:ring-2 focus-visible:outline-none',
        selected ? 'border-brand/25 bg-brand/16' : 'border-border bg-surface',
      ].join(' ')}
    >
      <span className="flex flex-col gap-0.5">
        <span
          className={[
            'font-display text-lg font-bold tracking-wide uppercase',
            selected ? 'text-brand' : 'text-fg',
          ].join(' ')}
        >
          {label}
        </span>
        {subtitle ? <span className="text-subtle text-sm">{subtitle}</span> : null}
      </span>
      {selected ? <span className="text-brand text-lg font-bold">✓</span> : null}
    </button>
  );
}
