import { NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildSystemPrompt } from '@/lib/buildSystemPrompt';
import { parseAIResponse } from '@/lib/parseAIResponse';
import { describeImage, streamChat, transcribeAudio } from '@/lib/openai';
import type { Company, Level, Topic } from '@/types';

const MARKERS = ['SCORES:', 'FINAL_REPORT:'];
const MAX_MARKER_LEN = Math.max(...MARKERS.map((m) => m.length));

function safeFlushIndex(full: string): { index: number; hitMarker: boolean } {
  let earliest = -1;
  for (const marker of MARKERS) {
    const idx = full.indexOf(marker);
    if (idx !== -1 && (earliest === -1 || idx < earliest)) {
      earliest = idx;
    }
  }
  if (earliest !== -1) {
    return { index: earliest, hitMarker: true };
  }
  const holdBack = Math.min(full.length, MAX_MARKER_LEN - 1);
  return { index: full.length - holdBack, hitMarker: false };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Не авторизован', { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return new Response('Некорректные данные', { status: 400 });
  }

  const {
    sessionId,
    messages,
    imageBase64,
    audioBase64,
    audioMimeType,
  }: {
    sessionId?: string;
    messages?: { role: 'user' | 'assistant'; content: string }[];
    imageBase64?: string | null;
    audioBase64?: string | null;
    audioMimeType?: string | null;
  } = body;

  if (!sessionId) {
    return new Response('sessionId обязателен', { status: 400 });
  }

  console.log('[api/chat] POST', {
    sessionId,
    messagesCount: messages?.length ?? 0,
    hasImage: Boolean(imageBase64),
    hasAudio: Boolean(audioBase64),
    audioMimeType,
    audioBase64Len: audioBase64?.length ?? 0,
  });

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    console.error('[api/chat] сессия не найдена или не принадлежит пользователю', {
      sessionId,
      userId: session.user.id,
      found: Boolean(interviewSession),
    });
    return new Response('Сессия не найдена', { status: 404 });
  }

  const chatMessages = [...(messages ?? [])];
  let hasImage = false;

  if (imageBase64) {
    hasImage = true;
    console.log('[api/chat] распознаю изображение, base64 длина:', imageBase64.length);
    try {
      const t0 = Date.now();
      const description = await describeImage(imageBase64);
      console.log('[api/chat] изображение распознано за', Date.now() - t0, 'мс, длина описания:', description.length);
      const lastUserIdx = chatMessages.length - 1;
      if (lastUserIdx >= 0 && chatMessages[lastUserIdx].role === 'user') {
        chatMessages[lastUserIdx] = {
          ...chatMessages[lastUserIdx],
          content: `${chatMessages[lastUserIdx].content}\n\n[Изображение]: ${description}`,
        };
      }
    } catch (err) {
      console.error('[api/chat] не удалось описать изображение:', err);
    }
  }

  let transcript: string | null = null;

  if (audioBase64) {
    console.log('[api/chat] распознаю аудио, mimeType:', audioMimeType, 'base64 длина:', audioBase64.length);
    try {
      const t0 = Date.now();
      transcript = await transcribeAudio(audioBase64, audioMimeType ?? 'audio/webm');
      console.log('[api/chat] аудио распознано за', Date.now() - t0, 'мс:', JSON.stringify(transcript));
      const lastUserIdx = chatMessages.length - 1;
      if (lastUserIdx >= 0 && chatMessages[lastUserIdx].role === 'user') {
        const base = chatMessages[lastUserIdx].content.trim();
        chatMessages[lastUserIdx] = {
          ...chatMessages[lastUserIdx],
          content: base ? `${base}\n\n${transcript}` : transcript,
        };
      }
    } catch (err) {
      console.error('[api/chat] не удалось распознать аудио:', err);
      const lastUserIdx = chatMessages.length - 1;
      if (lastUserIdx >= 0 && chatMessages[lastUserIdx].role === 'user' && !chatMessages[lastUserIdx].content.trim()) {
        chatMessages[lastUserIdx] = {
          ...chatMessages[lastUserIdx],
          content: '[голосовое сообщение — не удалось распознать]',
        };
      }
    }
  }

  const lastMessage = chatMessages[chatMessages.length - 1];
  if (lastMessage && lastMessage.role === 'user') {
    await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: lastMessage.content,
        hasImage,
      },
    });
  }

  const systemPrompt = buildSystemPrompt(
    interviewSession.company as Company,
    interviewSession.topic as Topic,
    interviewSession.level as Level
  );

  const chatInput = chatMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let full = '';
  let sentLen = 0;

  console.log('[api/chat] запускаю streamChat, model:', interviewSession.model, 'сообщений в контексте:', chatInput.length);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const streamT0 = Date.now();

      try {
        for await (const delta of streamChat({
          model: interviewSession.model,
          instructions: systemPrompt,
          messages: chatInput,
        })) {
          full += delta;
          const { index } = safeFlushIndex(full);
          if (index > sentLen) {
            controller.enqueue(encoder.encode(full.slice(sentLen, index)));
            sentLen = index;
          }
        }
        console.log('[api/chat] streamChat завершён за', Date.now() - streamT0, 'мс, получено символов:', full.length);
      } catch (err) {
        // Соединение с клиентом уже открыто (заголовки ушли), поэтому ошибку
        // нельзя вернуть HTTP-статусом — передаём её через __META__.
        console.error('[api/chat] сбой стрима после ретраев (прошло', Date.now() - streamT0, 'мс, накоплено символов:', full.length, '):', err);
        const message = err instanceof Error ? err.message : 'AI недоступен';
        controller.enqueue(encoder.encode(` __META__${JSON.stringify({ error: message })}`));
        controller.close();
        return;
      }

      try {
        const { cleanText, scores, finalReport } = parseAIResponse(full);
        console.log('[api/chat] разбор ответа: cleanText длина:', cleanText.length, 'scores:', scores, 'finalReport:', Boolean(finalReport));

        // добираем "хвост" чистого текста, если он не был отправлен из-за holdback
        if (cleanText.length > sentLen) {
          controller.enqueue(encoder.encode(cleanText.slice(sentLen)));
        }

        await prisma.message.create({
          data: {
            sessionId,
            role: 'assistant',
            content: cleanText,
            scores: scores ? (scores as unknown as Prisma.InputJsonValue) : undefined,
          },
        });

        let finalReportSaved = false;

        if (finalReport) {
          console.log('[api/chat] сохраняю финальный отчёт:', JSON.stringify(finalReport).slice(0, 500));
          const assistantMessages = await prisma.message.findMany({
            where: { sessionId, role: 'assistant' },
          });

          const allScores = assistantMessages
            .map((m) => m.scores as { accuracy: number; depth: number; clarity: number; confidence: number } | null)
            .filter(Boolean) as { accuracy: number; depth: number; clarity: number; confidence: number }[];

          const overallScore =
            allScores.length > 0
              ? Math.round(
                  allScores.reduce(
                    (sum, s) => sum + (s.accuracy + s.depth + s.clarity + s.confidence) / 4,
                    0
                  ) / allScores.length
                )
              : null;

          await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
              status: 'COMPLETED',
              verdict: finalReport.verdict,
              overallScore,
              summary: finalReport.summary,
              strongSides: finalReport.strong ?? [],
              weakSides: finalReport.weak ?? [],
              studyTopics: (finalReport.study ?? []) as unknown as Prisma.InputJsonValue,
              completedAt: new Date(),
            },
          });

          finalReportSaved = true;
        }

        // метаданные передаются в самом потоке за уникальным разделителем,
        // чтобы не жертвовать реальным стримингом ради заголовков ответа
        const meta = JSON.stringify({ scores, finalReportSaved, transcript });
        console.log('[api/chat] отправляю __META__:', meta);
        controller.enqueue(encoder.encode(` __META__${meta}`));

        controller.close();
        console.log('[api/chat] стрим закрыт, всего за', Date.now() - streamT0, 'мс');
      } catch (err) {
        // Тут же ловим всё, что может кинуть парсинг/запись в БД — иначе необработанное
        // исключение внутри start() ReadableStream валит весь процесс Node (Node 24
        // завершает процесс на unhandled rejection), а не только этот запрос.
        console.error('[api/chat] сбой при сохранении/финализации ответа:', err);
        try {
          const message = err instanceof Error ? err.message : 'Не удалось сохранить ответ';
          controller.enqueue(encoder.encode(` __META__${JSON.stringify({ error: message })}`));
          controller.close();
        } catch {
          // контроллер уже мог быть закрыт — не страшно
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
