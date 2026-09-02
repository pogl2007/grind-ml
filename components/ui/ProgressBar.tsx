interface ProgressBarProps {
  label: string;
  value: number;
  className?: string;
}

function colorForValue(value: number): string {
  if (value < 60) return '#da3633';
  if (value <= 80) return '#d29922';
  return '#238636';
}

export function ProgressBar({ label, value, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = colorForValue(clamped);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono-nums text-text-primary">{clamped}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-border">
        <div
          className="h-full rounded transition-[width] duration-150 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
