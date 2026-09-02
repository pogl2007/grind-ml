'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { RobotAvatar } from '@/components/session/RobotAvatar';

interface ScriptStep {
  role: 'ai' | 'user';
  text: string;
  code?: boolean;
}

const SCRIPT: ScriptStep[] = [
  { role: 'ai', text: 'Привет! Сегодня поговорим про SQL. Расскажи коротко о своём опыте?' },
  { role: 'user', text: 'Работал с PostgreSQL около года, писал аналитические запросы для дашбордов.' },
  {
    role: 'ai',
    text: 'Хорошо. Вопрос: как вывести топ-3 самых дорогих заказа по каждому клиенту?',
  },
  {
    role: 'user',
    code: true,
    text: 'SELECT * FROM (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY customer_id\n    ORDER BY amount DESC\n  ) rn\n  FROM orders\n) t\nWHERE rn <= 3;',
  },
  { role: 'ai', text: 'Точно — ROW_NUMBER() с PARTITION BY здесь то, что нужно 👍' },
];

const TYPING_MS = 1100;
const READ_MS = 1900;
const CODE_READ_MS = 2600;
const LOOP_PAUSE_MS = 2200;

type Phase = 'typing' | 'shown';

export function DemoChat() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');

  useEffect(() => {
    if (visibleCount >= SCRIPT.length) {
      const t = setTimeout(() => {
        setVisibleCount(0);
        setPhase('typing');
      }, LOOP_PAUSE_MS);
      return () => clearTimeout(t);
    }

    if (phase === 'typing') {
      const t = setTimeout(() => setPhase('shown'), TYPING_MS);
      return () => clearTimeout(t);
    }

    const step = SCRIPT[visibleCount];
    const readTime = step.code ? CODE_READ_MS : READ_MS;
    const t = setTimeout(() => {
      setVisibleCount((c) => c + 1);
      setPhase('typing');
    }, readTime);
    return () => clearTimeout(t);
  }, [visibleCount, phase]);

  const shown = SCRIPT.slice(0, visibleCount);
  const isTyping = visibleCount < SCRIPT.length && phase === 'typing';
  const typingRole = visibleCount < SCRIPT.length ? SCRIPT[visibleCount].role : null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-2xl font-medium text-text-primary">Так выглядит интервью изнутри</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-secondary">
          Живой пример диалога с ИИ-интервьюером — реальный формат, реальные вопросы
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative mt-8 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-[0_0_60px_rgba(88,166,255,0.08)]"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge>Яндекс</Badge>
            <Badge>SQL</Badge>
            <Badge>Junior</Badge>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-text" />
            демо
          </span>
        </div>

        <div className="flex min-h-[360px] flex-col gap-4 px-4 py-6 sm:min-h-[400px]">
          <AnimatePresence initial={false}>
            {shown.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`flex gap-3 ${step.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {step.role === 'ai' && <RobotAvatar />}
                <div
                  className={`max-w-[85%] rounded border px-4 py-3 text-sm leading-relaxed ${
                    step.role === 'user'
                      ? 'border-accent bg-accent-subtle text-text-primary'
                      : 'border-border bg-bg text-text-primary'
                  } ${step.code ? 'font-mono-nums whitespace-pre-wrap' : 'whitespace-pre-wrap'}`}
                >
                  {step.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && typingRole && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex gap-3 ${typingRole === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {typingRole === 'ai' && <RobotAvatar active />}
              <div
                className={`rounded border px-4 py-3 ${
                  typingRole === 'user'
                    ? 'border-accent bg-accent-subtle'
                    : 'border-border bg-bg'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-secondary" />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-secondary"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-secondary"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
