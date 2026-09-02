'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChatWindow } from '@/components/session/ChatWindow';
import { ChatInput } from '@/components/session/ChatInput';
import { MetricsSidebar } from '@/components/session/MetricsSidebar';
import { useInterviewSession } from '@/hooks/useSession';
import { useStreaming } from '@/hooks/useStreaming';
import type { Message, Scores } from '@/types';

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function SessionPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('id');
  const { session, isLoading } = useInterviewSession(sessionId);
  const { streamChat, streamingText, isStreaming } = useStreaming();

  const [localMessages, setLocalMessages] = useState<
    (Message & { imagePreview?: string | null; audioPreview?: string | null; isCode?: boolean })[]
  >([]);
  const [seconds, setSeconds] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const kickedOff = useRef(false);

  async function runKickoff() {
    if (!session) return;
    setChatError(null);
    try {
      const result = await streamChat({
        sessionId: session.id,
        messages: [],
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        sessionId: session.id,
        role: 'assistant',
        content: result.text,
        hasImage: false,
        scores: result.scores,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
      if (result.finalReportSaved) setFinished(true);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : 'Не удалось получить ответ от AI');
    }
  }

  useEffect(() => {
    if (session?.messages) {
      setLocalMessages(session.messages);
      if (session.status === 'COMPLETED') setFinished(true);
    }
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!session || kickedOff.current) return;
    if (session.messages && session.messages.length > 0) return;
    kickedOff.current = true;
    runKickoff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const averages: Scores = useMemo(() => {
    const scored = localMessages.filter((m) => m.role === 'assistant' && m.scores);
    if (scored.length === 0) return { accuracy: 0, depth: 0, clarity: 0, confidence: 0 };
    const sum = scored.reduce(
      (acc, m) => {
        const s = m.scores as Scores;
        return {
          accuracy: acc.accuracy + s.accuracy,
          depth: acc.depth + s.depth,
          clarity: acc.clarity + s.clarity,
          confidence: acc.confidence + s.confidence,
        };
      },
      { accuracy: 0, depth: 0, clarity: 0, confidence: 0 }
    );
    return {
      accuracy: Math.round(sum.accuracy / scored.length),
      depth: Math.round(sum.depth / scored.length),
      clarity: Math.round(sum.clarity / scored.length),
      confidence: Math.round(sum.confidence / scored.length),
    };
  }, [localMessages]);

  // Вводные вопросы на знакомстве не помечены scores — в счётчик идут только технические.
  const technicalMessages = localMessages.filter((m) => m.role === 'assistant' && m.scores);
  const questionsCount = technicalMessages.length;
  const topicsAsked = technicalMessages.map(
    (m) => m.content.slice(0, 60) + (m.content.length > 60 ? '…' : '')
  );

  async function requestAssistantReply(
    historyForModel: { role: 'user' | 'assistant'; content: string }[],
    imageBase64: string | null,
    audioBase64?: string | null,
    audioMimeType?: string | null,
    pendingUserMsgId?: string
  ) {
    if (!session) return;
    setChatError(null);
    try {
      const result = await streamChat({
        sessionId: session.id,
        messages: historyForModel,
        imageBase64,
        audioBase64,
        audioMimeType,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        sessionId: session.id,
        role: 'assistant',
        content: result.text,
        hasImage: false,
        scores: result.scores,
        createdAt: new Date().toISOString(),
      };

      setLocalMessages((prev) => {
        const withTranscript =
          pendingUserMsgId && result.transcript
            ? prev.map((m) => (m.id === pendingUserMsgId ? { ...m, content: result.transcript as string } : m))
            : prev;
        return [...withTranscript, assistantMsg];
      });
      if (result.finalReportSaved) setFinished(true);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : 'Не удалось получить ответ от AI');
    }
  }

  async function handleSend(
    text: string,
    imageBase64: string | null,
    isCode: boolean,
    audioBase64?: string | null,
    audioMimeType?: string | null,
    audioUrl?: string | null
  ) {
    if (!session) return;

    const userMsg: Message & { imagePreview?: string | null; audioPreview?: string | null; isCode?: boolean } = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      role: 'user',
      content: text || (audioBase64 ? 'Распознаём голосовое...' : ''),
      hasImage: Boolean(imageBase64),
      scores: null,
      createdAt: new Date().toISOString(),
      imagePreview: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null,
      audioPreview: audioUrl ?? null,
      isCode,
    };

    const nextLocal = [...localMessages, userMsg];
    setLocalMessages(nextLocal);

    // На сервер уходит исходный текст (может быть пустым для голосового —
    // сервер сам подставит туда расшифровку), плейсхолдер — только для UI.
    const historyForModel = nextLocal
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));
    historyForModel[historyForModel.length - 1] = { role: 'user', content: text };

    await requestAssistantReply(historyForModel, imageBase64, audioBase64, audioMimeType, userMsg.id);
  }

  function handleRetry() {
    if (localMessages.length === 0) {
      runKickoff();
      return;
    }
    const historyForModel = localMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));
    requestAssistantReply(historyForModel, null);
  }

  async function handleFinish() {
    router.push('/history');
  }

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-secondary">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="fixed top-0 z-20 flex h-12 w-full items-center justify-between border-b border-border bg-bg px-4">
        <div className="flex items-center gap-2">
          <Badge>{session.company}</Badge>
          <Badge>{session.topic}</Badge>
          <Badge>{session.level}</Badge>
        </div>
        <div className="font-mono-nums text-sm text-text-primary">{formatTimer(seconds)}</div>
        <div className="flex items-center gap-2">
          <Badge tone="muted" mono>
            ИИ
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            Метрики
          </Button>
          <Button variant="outline" size="sm" onClick={handleFinish}>
            Завершить
          </Button>
        </div>
      </div>

      <div className="mt-12 flex-1 pb-32">
        <ChatWindow messages={localMessages} streamingText={streamingText} isStreaming={isStreaming} />

        {finished && (
          <div className="mx-auto max-w-[760px] px-4">
            <div className="flex items-center justify-between rounded border border-accent bg-accent-subtle px-4 py-3">
              <span className="text-sm text-accent-text">Сессия завершена</span>
              <Link href={`/report/${session.id}`}>
                <Button size="sm">Смотреть отчёт →</Button>
              </Link>
            </div>
          </div>
        )}

        {chatError && !finished && (
          <div className="mx-auto max-w-[760px] px-4">
            <div className="flex items-center justify-between rounded border border-red-500/50 bg-red-500/10 px-4 py-3">
              <span className="text-sm text-red-400">{chatError}</span>
              <Button size="sm" variant="outline" onClick={handleRetry} disabled={isStreaming}>
                Повторить
              </Button>
            </div>
          </div>
        )}
      </div>

      {!finished && (
        <div className="fixed bottom-0 w-full">
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      )}

      <MetricsSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        averages={averages}
        questionsCount={questionsCount}
        topics={topicsAsked}
      />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense>
      <SessionPageInner />
    </Suspense>
  );
}
