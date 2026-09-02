import { ReactNode } from 'react';

type Tone = 'default' | 'accent' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  mono?: boolean;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  default: 'bg-surface text-text-secondary border-border-strong',
  accent: 'bg-accent-subtle text-accent-text border-accent',
  warning: 'bg-warning-subtle text-warning border-warning',
  danger: 'bg-danger/10 text-danger border-danger',
  muted: 'bg-surface text-text-muted border-border',
};

export function Badge({ children, tone = 'default', mono, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs ${toneClasses[tone]} ${mono ? 'font-mono-nums' : ''} ${className}`}
    >
      {children}
    </span>
  );
}
