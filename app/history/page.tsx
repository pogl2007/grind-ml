'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { SessionList } from '@/components/history/SessionList';
import { ProgressChart } from '@/components/history/ProgressChart';
import { SessionPreview } from '@/components/history/SessionPreview';
import type { InterviewSession } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data: InterviewSession[]) => {
        setSessions(data);
        if (data.length > 0) setActiveId(data[0].id);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-secondary">
        Загрузка...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-bg">
        <AppHeader />
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-text-secondary">
          <p>Ещё нет сессий</p>
          <Button onClick={() => router.push('/setup')}>Начать первое интервью</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />
      <div className="px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row">
          <div className="w-full flex-shrink-0 md:w-[360px]">
            <h1 className="mb-4 text-lg font-medium text-text-primary">История</h1>
            <SessionList sessions={sessions} activeId={activeId} onSelect={setActiveId} />
          </div>

          <div className="flex-1">
            <ProgressChart sessions={sessions} />
            {activeSession && <SessionPreview session={activeSession} />}
          </div>
        </div>
      </div>
    </div>
  );
}
