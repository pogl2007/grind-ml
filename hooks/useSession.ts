'use client';

import { useEffect, useState } from 'react';
import type { InterviewSession } from '@/types';

export function useInterviewSession(sessionId: string | null) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Не удалось загрузить сессию');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSession(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { session, isLoading, error, setSession };
}
