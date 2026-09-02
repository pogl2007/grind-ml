'use client';

import { motion } from 'framer-motion';

interface RobotMascotProps {
  className?: string;
}

export function RobotMascot({ className = '' }: RobotMascotProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.svg
        viewBox="0 0 240 260"
        className="h-full w-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="rm-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7ee2a8" />
            <stop offset="100%" stopColor="#58a6ff" />
          </linearGradient>
          <linearGradient id="rm-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3fb950" />
            <stop offset="100%" stopColor="#238636" />
          </linearGradient>
          <linearGradient id="rm-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b6f39" />
            <stop offset="100%" stopColor="#1a4d29" />
          </linearGradient>
          <radialGradient id="rm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a371f7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a371f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="110" cy="235" rx="70" ry="14" fill="#a371f7" opacity="0.12" />
        <circle cx="110" cy="130" r="110" fill="url(#rm-glow)" />

        <line x1="110" y1="20" x2="110" y2="46" stroke="#7d8590" strokeWidth="3" />
        <motion.circle
          cx="110"
          cy="14"
          r="8"
          fill="#a371f7"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />

        <polygon points="60,50 160,50 195,72 95,72" fill="url(#rm-top)" />
        <polygon points="60,50 95,72 95,132 60,110" fill="url(#rm-side)" />
        <polygon points="95,72 195,72 195,110 95,132" fill="url(#rm-front)" />

        <circle cx="125" cy="95" r="10" fill="#0d1117" />
        <motion.circle
          cx="125"
          cy="95"
          r="5"
          fill="#e6edf3"
          animate={{ scaleY: [1, 0.15, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.6 }}
        />
        <circle cx="165" cy="95" r="10" fill="#0d1117" />
        <motion.circle
          cx="165"
          cy="95"
          r="5"
          fill="#e6edf3"
          animate={{ scaleY: [1, 0.15, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.6, delay: 0.08 }}
        />
        <path d="M130 112 Q145 120 160 112" stroke="#0d1117" strokeWidth="3" fill="none" strokeLinecap="round" />

        <polygon points="70,140 175,140 210,164 105,164" fill="url(#rm-top)" opacity="0.9" />
        <polygon points="70,140 105,164 105,225 70,201" fill="url(#rm-side)" />
        <polygon points="105,164 210,164 210,201 105,225" fill="url(#rm-front)" />

        <rect x="130" y="178" width="52" height="34" rx="6" fill="#0d1117" opacity="0.5" />
        <motion.circle
          cx="156"
          cy="195"
          r="9"
          fill="#3fb950"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />

        <motion.g
          animate={{ rotate: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '68px 168px' }}
        >
          <circle cx="55" cy="185" r="12" fill="url(#rm-front)" />
        </motion.g>
        <motion.g
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ transformOrigin: '212px 168px' }}
        >
          <circle cx="225" cy="185" r="12" fill="url(#rm-front)" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
