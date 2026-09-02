import { Badge } from '@/components/ui/Badge';
import type { InterviewSession } from '@/types';

interface SessionCardProps {
  session: InterviewSession;
  active: boolean;
  onClick: () => void;
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-text-muted';
  if (score < 60) return 'text-danger';
  if (score <= 80) return 'text-warning';
  return 'text-accent-text';
}

export function SessionCard({ session, active, onClick }: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col gap-2 rounded border bg-surface p-4 text-left transition-colors duration-150 ease-out hover:bg-surface-hover ${
        active ? 'border-l-4 border-l-accent border-y-border border-r-border' : 'border-border'
      }`}
    >
      <div className="flex items-center gap-2">
        <Badge>{session.company}</Badge>
        <Badge>{session.topic}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {new Date(session.createdAt).toLocaleDateString('ru-RU')}
        </span>
        <span className={`font-mono-nums text-sm ${scoreColor(session.overallScore)}`}>
          {session.overallScore ?? '—'}
        </span>
      </div>
      {session.summary && (
        <p className="truncate text-xs text-text-secondary">{session.summary}</p>
      )}
    </button>
  );
}
