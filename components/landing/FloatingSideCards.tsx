'use client';

import { motion } from 'framer-motion';

interface SideCard {
  side: 'left' | 'right';
  top: string;
  delay: number;
  rotate: number;
  content: React.ReactNode;
  mono?: boolean;
}

const CARDS: SideCard[] = [
  {
    side: 'left',
    top: '4%',
    delay: 0,
    rotate: -6,
    mono: true,
    content: (
      <>
        <span className="text-accent-3">SELECT</span> * <span className="text-accent-3">FROM</span> candidates
        <br />
        <span className="text-accent-3">WHERE</span> ready = true;
      </>
    ),
  },
  {
    side: 'right',
    top: '2%',
    delay: 0.3,
    rotate: 5,
    content: (
      <>
        <div className="text-text-secondary">Точность</div>
        <div className="font-mono-nums text-lg text-accent-text">92%</div>
      </>
    ),
  },
  {
    side: 'left',
    top: '38%',
    delay: 0.6,
    rotate: 4,
    content: <div className="text-text-secondary">«Объясни bias-variance tradeoff»</div>,
  },
  {
    side: 'right',
    top: '40%',
    delay: 0.15,
    rotate: -5,
    content: (
      <>
        <div className="text-text-secondary">Вердикт</div>
        <div className="text-accent-text">HIRE ✓</div>
      </>
    ),
  },
  {
    side: 'left',
    top: '70%',
    delay: 0.45,
    rotate: -3,
    mono: true,
    content: (
      <>
        PARTITION BY customer_id
        <br />
        ORDER BY amount DESC
      </>
    ),
  },
  {
    side: 'right',
    top: '74%',
    delay: 0.5,
    rotate: 6,
    content: <div className="text-text-secondary">«Расскажи про overfitting»</div>,
  },
];

export function FloatingSideCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden 2xl:block" aria-hidden>
      {CARDS.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [0, -14, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: card.delay },
            y: { duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: card.delay },
          }}
          style={{
            position: 'absolute',
            top: card.top,
            [card.side]: '2%',
            rotate: `${card.rotate}deg`,
          }}
          className={`w-52 rounded border border-border-strong bg-surface/80 px-3 py-2.5 text-xs shadow-lg backdrop-blur ${
            card.mono ? 'font-mono-nums' : ''
          }`}
        >
          {card.content}
        </motion.div>
      ))}
    </div>
  );
}
