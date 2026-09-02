import Link from 'next/link';
import type { InterviewSession } from '@/types';

function verdictLabel(verdict: string | null): string {
  if (verdict === 'hire') return 'HIRE';
  if (verdict === 'reservations') return 'HIRE WITH RESERVATIONS';
  if (verdict === 'not_yet') return 'NOT YET';
  return 'В процессе';
}

export function SessionPreview({ session }: { session: InterviewSession }) {
  return (
    <div className="mt-6 rounded border border-border bg-surface p-5">
      <div className="mb-3 text-sm font-medium text-text-primary">{verdictLabel(session.verdict)}</div>

      {session.strongSides.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs uppercase tracking-wide text-text-secondary">Сильные стороны</p>
          <p className="text-xs text-text-primary">{session.strongSides.join(', ')}</p>
        </div>
      )}

      {session.weakSides.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-text-secondary">Зоны роста</p>
          <p className="text-xs text-text-primary">{session.weakSides.join(', ')}</p>
        </div>
      )}

      <Link href={`/report/${session.id}`} className="text-xs text-accent-text hover:underline">
        Открыть полный отчёт →
      </Link>
    </div>
  );
}
