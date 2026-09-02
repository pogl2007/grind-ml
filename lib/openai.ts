import OpenAI, { toFile } from 'openai';
import { fetch as undiciFetch } from 'undici';

// Next.js в App Router подменяет глобальный fetch (кеш/дедупликация запросов и
// собственная инструментация), из-за чего у запросов к провайдеру то рвётся
// стриминг (401 там, где обычный fetch отрабатывает нормально), то падает multipart-
// загрузка файла ("duplex option is required" / "Response body... disturbed or locked").
// Используем undici напрямую в обход патча Next, чтобы эти запросы шли как обычный fetch.
// duplex: 'half' обязателен у undici для запроса с телом (multipart-загрузка файла).
const providerFetch: typeof fetch = (input, init) =>
  undiciFetch(input as string, { ...init, duplex: init?.body ? 'half' : undefined } as never) as unknown as Promise<Response>;

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  fetch: providerFetch,
});

// Разворачиваем ошибку целиком (включая cause — там обычно и есть суть,
// как в случае с "duplex option is required" или "Response body disturbed").
function describeError(err: unknown): Record<string, unknown> {
  if (!(err instanceof Error)) return { raw: String(err) };
  const cause = (err as { cause?: unknown }).cause;
  return {
    name: err.name,
    message: err.message,
    status: (err as { status?: number }).status,
    code: (err as { code?: string }).code,
    type: (err as { type?: string }).type,
    cause: cause instanceof Error ? { name: cause.name, message: cause.message } : cause,
    stack: err.stack?.split('\n').slice(0, 4).join(' | '),
  };
}

// Модели провайдера подобраны под задачи и не показываются пользователю на сайте —
// снаружи это просто «встроенный ИИ» без выбора модели.
export const AI_MODELS = {
  free: 'openai/gpt-5.6-luna',
  pro: 'openai/gpt-5.6-luna-pro',
  vision: 'openai/gpt-5.6-luna-pro',
  transcription: 'mistralai/voxtral-mini-3b-2507',
} as const;

export async function describeImage(imageBase64: string): Promise<string> {
  console.log('[describeImage] запрос, base64 длина:', imageBase64.length, 'model:', AI_MODELS.vision);
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.vision,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Опиши подробно, что изображено на этой картинке. Если это код, условие задачи, схема или таблица — расшифруй текст и структуру максимально точно и полно, на русском языке.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 700,
    });

    return response.choices[0]?.message?.content ?? '';
  } catch (err) {
    console.error('[describeImage] ошибка:', describeError(err));
    throw err;
  }
}

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(audioBase64, 'base64');
  const ext = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
  console.log(
    `[transcribeAudio] mimeType=${mimeType} size=${buffer.length} bytes, первые байты: ${buffer.subarray(0, 8).toString('hex')}`
  );

  let lastErr: unknown;
  // SDK-шный авторетрай на сетевом сбое переиспользует уже прочитанный поток файла
  // ("Response body disturbed or locked") — ретраим сами, пересобирая файл заново,
  // и просим SDK не ретраить самостоятельно (maxRetries: 0).
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const t0 = Date.now();
      const file = await toFile(buffer, `audio.${ext}`, { type: mimeType });
      const response = await openai.audio.transcriptions.create(
        // language: 'ru' — без явного указания модель иногда сама переводит речь
        // на английский вместо транскрипции на исходном языке.
        { file, model: AI_MODELS.transcription, language: 'ru' },
        { maxRetries: 0 }
      );
      console.log(`[transcribeAudio] попытка ${attempt}/3 успешна за ${Date.now() - t0} мс, текст:`, JSON.stringify(response.text));
      return response.text ?? '';
    } catch (err) {
      lastErr = err;
      console.error(`[transcribeAudio] попытка ${attempt}/3 провалилась:`, describeError(err));
      if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  console.error('[transcribeAudio] все 3 попытки провалились, сдаюсь. Последняя ошибка:', describeError(lastErr));
  throw lastErr instanceof Error ? lastErr : new Error('Не удалось распознать аудио');
}

interface ChatStreamOptions {
  model: string;
  instructions: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 600;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function* streamChat(options: ChatStreamOptions): AsyncGenerator<string> {
  let lastStatus: number | null = null;
  console.log('[streamChat] старт, model:', options.model, 'сообщений:', options.messages.length);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const t0 = Date.now();
      const stream = await openai.chat.completions.create({
        model: options.model,
        messages: [
          { role: 'system', content: options.instructions },
          ...options.messages,
        ],
        stream: true,
      });

      let chunkCount = 0;
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          chunkCount++;
          yield delta;
        }
      }
      console.log(`[streamChat] попытка ${attempt} успешна, чанков: ${chunkCount}, за ${Date.now() - t0} мс`);
      return;
    } catch (err) {
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status?: number }).status ?? null : null;
      lastStatus = status;
      console.error(`[streamChat] попытка ${attempt}/${MAX_ATTEMPTS} провалилась:`, describeError(err));
      // Апстрим (за DDoS-Guard) иногда флапает 5xx и даже 401/429 при частых запросах подряд —
      // ретраим с паузой, чтобы не попадать под burst-блокировку.
      const retryable = status !== null && (status >= 500 || status === 401 || status === 429);
      if (retryable && attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      throw new Error(`Не удалось получить ответ от AI: ${status ?? (err instanceof Error ? err.message : 'unknown')}`);
    }
  }

  throw new Error(`Не удалось получить ответ от AI: ${lastStatus}`);
}
