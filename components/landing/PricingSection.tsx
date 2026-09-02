'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const FREE_ITEMS = [
  { text: 'Уровень: Junior', included: true },
  { text: 'Темы: Classical ML, SQL', included: true },
  { text: 'Компания: Яндекс', included: true },
  { text: '2 сессии в день', included: true },
  { text: 'История: 5 сессий', included: true },
  { text: 'Middle, Senior', included: false },
  { text: 'Deep Learning, System Design, Stats', included: false },
  { text: 'Сбер, VK, Тинькофф, Озон', included: false },
];

const PRO_ITEMS = [
  'Все уровни',
  'Все темы',
  'Все компании',
  'Безлимитные сессии',
  'Полная история',
  'Более мощная модель ИИ',
  'Значок PRO',
];

export function PricingSection() {
  const { user, isAuthenticated } = useCurrentUser();
  const isPro = (user as { plan?: string } | null)?.plan === 'PRO';

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center text-2xl font-medium text-text-primary"
      >
        Тарифы
      </motion.h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full p-6">
            <h3 className="text-lg font-medium text-text-primary">FREE</h3>
            <p className="font-mono-nums mt-1 text-2xl text-text-primary">0 ₽</p>
            <ul className="mt-5 flex flex-col gap-2 text-sm">
              {FREE_ITEMS.map((item) => (
                <li
                  key={item.text}
                  className={item.included ? 'text-text-secondary' : 'text-text-muted'}
                >
                  {item.included ? '✓' : '×'} {item.text}
                </li>
              ))}
            </ul>
            {isAuthenticated ? (
              <Button variant="outline" fullWidth disabled className="mt-6">
                {isPro ? 'Текущий план недоступен' : 'Ваш текущий план'}
              </Button>
            ) : (
              <Link href="/auth/register" className="mt-6 block">
                <Button variant="outline" fullWidth>
                  Начать бесплатно
                </Button>
              </Link>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-accent-2 p-6 shadow-[0_0_40px_rgba(163,113,247,0.15)]">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-text-primary">PRO</h3>
              <span className="rounded-full bg-accent-2/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-2-text">
                популярно
              </span>
            </div>
            <p className="font-mono-nums mt-1 text-2xl text-text-primary">
              199 ₽<span className="text-sm text-text-secondary"> / мес</span>
            </p>
            <ul className="mt-5 flex flex-col gap-2 text-sm text-text-secondary">
              {PRO_ITEMS.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
            {isAuthenticated && isPro ? (
              <Button fullWidth disabled className="mt-6">
                Уже активен
              </Button>
            ) : (
              <Link href="/subscription" className="mt-6 block">
                <Button fullWidth>Попробовать PRO</Button>
              </Link>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
