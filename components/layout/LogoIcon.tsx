interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className = 'h-6 w-6' }: LogoIconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3fb950" />
          <stop offset="60%" stopColor="#58a6ff" />
          <stop offset="100%" stopColor="#a371f7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logo-grad)" />
      <circle cx="12.5" cy="15" r="2.6" fill="#0d1117" />
      <circle cx="19.5" cy="15" r="2.6" fill="#0d1117" />
      <path d="M12 21c1.2 1.1 2.6 1.7 4 1.7s2.8-.6 4-1.7" stroke="#0d1117" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="16" y1="4.5" x2="16" y2="7.5" stroke="#0d1117" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
