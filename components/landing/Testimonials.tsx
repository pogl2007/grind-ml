'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

const REVIEWS = [
  {
    name: 'Алексей',
    role: 'ML-инженер, прошёл в Яндекс',
    text: 'Прогнал через сервис штук десять интервью перед реальным собесом. На настоящем интервью половина вопросов оказалась знакомой — уже не терялся.',
  },
  {
    name: 'Марина',
    role: 'Data Scientist, Junior → Middle',
    text: 'Больше всего понравилось, что не даёт готовый ответ, а докапывается уточняющими вопросами — ровно как на живом собесе.',
  },
  {
    name: 'Дмитрий',
    role: 'аналитик, готовился к SQL-секции',
    text: 'Отчёт после каждой сессии реально помогает — видно, в чём проседаешь, и что учить дальше, а не просто "молодец/не молодец".',
  },
  {
    name: 'Ольга',
    role: 'выпускница, первая работа в DS',
    text: 'Было страшно идти на первое техническое интервью. После недели тренировок здесь страх прошёл — уже знала, чего ожидать.',
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center text-2xl font-medium text-text-primary"
      >
        Что говорят те, кто уже прошёл
      </motion.h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REVIEWS.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Card className="h-full p-5" hoverable>
              <p className="text-sm leading-relaxed text-text-secondary">«{r.text}»</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-text to-accent-3 text-xs font-medium text-bg">
                  {r.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{r.name}</div>
                  <div className="text-xs text-text-muted">{r.role}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
