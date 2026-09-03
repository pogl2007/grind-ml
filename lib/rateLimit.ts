// Простой in-memory rate-limiter (скользящее окно). Процесс один (pm2, fork-режим),
// поэтому Map в памяти достаточно — не нужен Redis ради пары эндпоинтов.
const buckets = new Map<string, number[]>();

// Периодически подчищаем совсем старые записи, чтобы Map не рос бесконечно.
const MAX_TRACKED_AGE_MS = 60 * 60 * 1000;
setInterval(() => {
  const cutoff = Date.now() - MAX_TRACKED_AGE_MS;
  for (const [key, timestamps] of buckets) {
    const fresh = timestamps.filter((t) => t > cutoff);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}, 10 * 60 * 1000).unref();

/**
 * Возвращает true, если запрос разрешён (и засчитывает его), false — если лимит исчерпан.
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= max) {
    buckets.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}

export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
