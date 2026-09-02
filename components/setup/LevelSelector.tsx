'use client';

import { LEVELS, type Level } from '@/types';
import { Tooltip } from '@/components/ui/Tooltip';

interface LevelSelectorProps {
  value: Level | null;
  onChange: (value: Level) => void;
  allowed: Level[];
}

export function LevelSelector({ value, onChange, allowed }: LevelSelectorProps) {
  return (
    <div>
      <h3 className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Уровень</h3>
      <div className="flex flex-wrap gap-2">
        {LEVELS.map(({ value: level, label }) => {
          const isAllowed = allowed.includes(level);
          const isSelected = value === level;

          const button = (
            <button
              key={level}
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && onChange(level)}
              className={`flex items-center gap-1.5 rounded border px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                isSelected
                  ? 'border-accent bg-accent-subtle text-accent-text'
                  : isAllowed
                    ? 'border-border-strong bg-surface text-text-primary hover:bg-surface-hover'
                    : 'cursor-not-allowed border-border bg-surface text-text-muted opacity-60'
              }`}
            >
              {label}
              {!isAllowed && <span>🔒</span>}
            </button>
          );

          return isAllowed ? (
            button
          ) : (
            <Tooltip key={level} content="Доступно в PRO">
              {button}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
