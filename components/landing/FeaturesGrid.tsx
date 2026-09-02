'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

const FEATURES = [
  { icon: '🎯', title: '5 компаний', desc: 'персонализированный стиль интервьюера' },
  { icon: '💬', title: 'Реальные вопросы', desc: 'ML, DL, SQL, System Design, Stats' },
  { icon: '📊', title: 'Живая оценка', desc: 'метрики после каждого ответа' },
  { icon: '📷', title: 'Фото задач', desc: 'скинь скрин условия, AI прочитает' },
  { icon: '🎤', title: 'Голосовые ответы', desc: 'отвечай голосом — распознаём и разбираем' },
  { icon: '📈', title: 'Прогресс', desc: 'вся история сессий и рост скора' },
];

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
          >
            <Card className="h-full p-5" hoverable>
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-1 text-sm font-medium text-text-primary">{f.title}</h3>
              <p className="text-xs text-text-secondary">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
