import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#161b22',
        'surface-hover': '#1c2128',
        border: '#21262d',
        'border-strong': '#30363d',
        'text-primary': '#e6edf3',
        'text-secondary': '#7d8590',
        'text-muted': '#484f58',
        accent: '#238636',
        'accent-hover': '#2ea043',
        'accent-subtle': '#0d2818',
        'accent-text': '#3fb950',
        danger: '#da3633',
        warning: '#d29922',
        'warning-subtle': '#2a1f00',
        'accent-2': '#a371f7',
        'accent-2-text': '#c297ff',
        'accent-3': '#58a6ff',
      },
      backgroundImage: {
        'landing-glow':
          'radial-gradient(60% 50% at 50% 0%, rgba(163,113,247,0.16) 0%, rgba(88,166,255,0.08) 45%, rgba(13,17,23,0) 80%)',
        'brand-gradient': 'linear-gradient(90deg, #3fb950 0%, #58a6ff 50%, #a371f7 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      fontSize: {
        base: ['14px', '1.5'],
      },
    },
  },
  plugins: [],
};

export default config;
