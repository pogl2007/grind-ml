'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { num: '01', text: 'Выбери компанию, тему и уровень' },
  { num: '02', text: 'Отвечай текстом, кодом, фото или голосом' },
  { num: '03', text: 'Получи отчёт с планом роста' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center text-2xl font-medium text-text-primary"
      >
        Как это работает
      </motion.h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="flex items-center gap-4"
          >
            <span className="bg-brand-gradient bg-clip-text font-mono-nums text-3xl text-transparent">
              {s.num}
            </span>
            <p className="text-sm text-text-secondary">{s.text}</p>
            {i < STEPS.length - 1 && (
              <span className="hidden text-text-muted sm:inline">→</span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
