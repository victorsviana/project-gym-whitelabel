type ProgressBarColor = 'brand' | 'protein' | 'carbs' | 'fat' | 'water' | 'success';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressBarColor;
  label?: string;
}

const COLOR_CLASSES: Record<ProgressBarColor, string> = {
  brand: 'bg-brand',
  protein: 'bg-protein',
  carbs: 'bg-carbs',
  fat: 'bg-fat',
  water: 'bg-water',
  success: 'bg-success',
};

export function ProgressBar({ value, max = 100, color = 'brand', label }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="bg-surface-2 h-2 w-full overflow-hidden rounded-full"
    >
      <div
        className={[
          'h-full rounded-full transition-[width] duration-300 ease-out',
          COLOR_CLASSES[color],
        ].join(' ')}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
