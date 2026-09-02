interface ScoreBadgeProps {
  label: string;
  value: number;
}

function tone(value: number): { text: string; bg: string; border: string } {
  if (value < 60) return { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger' };
  if (value <= 80)
    return { text: 'text-warning', bg: 'bg-warning-subtle', border: 'border-warning' };
  return { text: 'text-accent-text', bg: 'bg-accent-subtle', border: 'border-accent' };
}

export function ScoreBadge({ label, value }: ScoreBadgeProps) {
  const t = tone(value);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-mono-nums ${t.text} ${t.bg} ${t.border}`}
    >
      {label} {value}%
    </span>
  );
}
