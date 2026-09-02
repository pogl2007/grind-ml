'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { RobotMascot } from '@/components/landing/RobotMascot';

export function HeroSection() {
  const { isAuthenticated } = useCurrentUser();

  return (
    <section className="relative overflow-hidden bg-landing-glow">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 px-4 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:gap-4 lg:py-32">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-3 py-1 text-xs text-text-secondary backdrop-blur"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-text" />
            Тренируйся на реальных вопросах топ-компаний
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl font-medium leading-tight text-text-primary sm:text-6xl"
          >
            Собеседование
            <br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">без стресса.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-5 max-w-xl text-base text-text-secondary sm:text-lg lg:mx-0"
          >
            AI-симулятор технических интервью для ML и DS.
            <br />
            Яндекс · Сбер · VK · Тинькофф · Озон
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9 flex items-center justify-center gap-3 lg:justify-start"
          >
            <Link href={isAuthenticated ? '/setup' : '/auth/register'}>
              <Button size="lg" className="shadow-[0_0_24px_rgba(63,185,80,0.35)]">
                {isAuthenticated ? 'Начать интервью →' : 'Начать бесплатно'}
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" size="lg">
                Как это работает?
              </Button>
            </a>
          </motion.div>
        </div>

        <div className="mx-auto hidden h-64 w-64 lg:block">
          <RobotMascot className="h-full w-full" />
        </div>
      </div>
    </section>
  );
}
