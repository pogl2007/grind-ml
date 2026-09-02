'use client';

import { useCallback, useRef, useState } from 'react';
import type { Scores } from '@/types';

interface StreamChatArgs {
  sessionId: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  imageBase64?: string | null;
  audioBase64?: string | null;
  audioMimeType?: string | null;
}

interface StreamResult {
  text: string;
  scores: Scores | null;
  finalReportSaved: boolean;
  transcript: string | null;
}

export function useStreaming() {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const streamChat = useCallback(async (args: StreamChatArgs): Promise<StreamResult> => {
    setIsStreaming(true);
    setStreamingText('');
    const controller = new AbortController();
    abortRef.current = controller;

    const reqInfo = {
      sessionId: args.sessionId,
      messagesCount: args.messages.length,
      hasImage: Boolean(args.imageBase64),
      hasAudio: Boolean(args.audioBase64),
      audioMimeType: args.audioMimeType,
      audioBase64Len: args.audioBase64?.length ?? 0,
    };
    console.log('[useStreaming] отправляю запрос /api/chat:', reqInfo);
    const t0 = performance.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        signal: controller.signal,
      });

      console.log('[useStreaming] ответ получен за', Math.round(performance.now() - t0), 'мс. status:', res.status, 'ok:', res.ok, 'has body:', Boolean(res.body));

      if (!res.ok || !res.body) {
        const bodyText = await res.text().catch(() => '<не удалось прочитать>');
        console.error('[useStreaming] сервер вернул ошибку:', res.status, bodyText);
        throw new Error('Не удалось получить ответ от AI');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        const metaIdx = acc.indexOf(' __META__');
        setStreamingText(metaIdx === -1 ? acc : acc.slice(0, metaIdx));
      }

      console.log('[useStreaming] стрим завершён. Чанков:', chunkCount, 'всего байт (символов):', acc.length, 'за', Math.round(performance.now() - t0), 'мс');

      let scores: Scores | null = null;
      let finalReportSaved = false;
      let transcript: string | null = null;
      let text = acc;

      const metaIdx = acc.indexOf(' __META__');
      if (metaIdx !== -1) {
        text = acc.slice(0, metaIdx);
        let meta: { scores?: Scores; finalReportSaved?: boolean; error?: string; transcript?: string | null } | null =
          null;
        try {
          meta = JSON.parse(acc.slice(metaIdx + ' __META__'.length));
        } catch (err) {
          console.error('[useStreaming] не удалось распарсить __META__ JSON:', acc.slice(metaIdx), err);
        }
        console.log('[useStreaming] meta разобрана:', meta);
        if (meta?.error) throw new Error(meta.error);
        scores = meta?.scores ?? null;
        finalReportSaved = Boolean(meta?.finalReportSaved);
        transcript = meta?.transcript ?? null;
      } else {
        console.warn('[useStreaming] маркер __META__ не найден в ответе — что-то не так на сервере. Хвост ответа:', JSON.stringify(acc.slice(-100)));
      }

      return { text, scores, finalReportSaved, transcript };
    } catch (err) {
      console.error('[useStreaming] streamChat упал с ошибкой:', err, 'запрос был:', reqInfo);
      throw err;
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { streamChat, streamingText, isStreaming, stop };
}
