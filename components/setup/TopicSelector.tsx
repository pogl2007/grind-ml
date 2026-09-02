'use client';

import { TOPICS, type Topic } from '@/types';
import { Tooltip } from '@/components/ui/Tooltip';

interface TopicSelectorProps {
  value: Topic | null;
  onChange: (value: Topic) => void;
  allowed: Topic[];
}

export function TopicSelector({ value, onChange, allowed }: TopicSelectorProps) {
  return (
    <div>
      <h3 className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Тема</h3>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map(({ value: topic, label }) => {
          const isAllowed = allowed.includes(topic);
          const isSelected = value === topic;

          const button = (
            <button
              key={topic}
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && onChange(topic)}
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
            <Tooltip key={topic} content="Доступно в PRO">
              {button}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
