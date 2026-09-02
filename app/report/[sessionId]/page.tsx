'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useInterviewSession } from '@/hooks/useSession';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import type { StudyTopic } from '@/types';

function scoreColor(score: number): string {
  if (score < 60) return '#da3633';
  if (score <= 80) return '#d29922';
  return '#238636';
}

function verdictDisplay(verdict: string | null): { text: string; className: string } {
  if (verdict === 'hire') return { text: 'HIRE', className: 'text-accent-text' };
  if (verdict === 'reservations')
    return { text: 'HIRE WITH RESERVATIONS', className: 'text-warning' };
  return { text: 'NOT YET', className: 'text-text-muted' };
}

function formatDuration(createdAt: string, completedAt: string | null): string {
  if (!completedAt) return '—';
  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime();
  const minutes = Math.round(ms / 60000);
  return `${minutes} мин`;
}

export default function ReportPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { session, isLoading, error } = useInterviewSession(params.sessionId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-secondary">
        Загрузка...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-secondary">
        Отчёт не найден
      </div>
    );
  }

  const verdict = verdictDisplay(session.verdict);
  const score = session.overallScore ?? 0;
  const study = (session.studyTopics ?? []) as StudyTopic[];

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-text-primary">Отчёт о сессии</h1>
            <p className="mt-1 text-xs text-text-secondary">
              {new Date(session.createdAt).toLocaleDateString('ru-RU')} · {session.company} ·{' '}
              {session.topic} · {formatDuration(session.createdAt, session.completedAt)}
            </p>
          </div>
          <div
            className="font-mono-nums flex h-20 w-20 items-center justify-center rounded-full border-2 text-2xl"
            style={{ borderColor: scoreColor(score), color: scoreColor(score) }}
          >
            {score}
          </div>
        </div>

        <div className="mb-8 rounded border border-border bg-surface p-6 text-center">
          <div className={`font-mono-nums text-5xl ${verdict.className}`}>{verdict.text}</div>
          {session.summary && <p className="mt-3 text-sm text-text-secondary">{session.summary}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-wide text-text-secondary">
              Сильные стороны
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {session.strongSides.map((s, i) => (
                <li key={i} className="text-text-primary">
                  <span className="text-accent-text">+</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs uppercase tracking-wide text-text-secondary">Зоны роста</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {session.weakSides.map((s, i) => (
                <li key={i} className="text-text-primary">
                  <span className="text-warning">—</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs uppercase tracking-wide text-text-secondary">
              Что изучить
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {study.map((s, i) => (
                <li key={i} className="text-text-primary">
                  →{' '}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-text hover:underline"
                  >
                    {s.topic}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <Button onClick={() => router.push('/setup')}>Новая сессия</Button>
          <Link href="/history">
            <Button variant="outline">История сессий</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
