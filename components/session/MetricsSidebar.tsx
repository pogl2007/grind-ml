'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Scores } from '@/types';

interface MetricsSidebarProps {
  open: boolean;
  onClose: () => void;
  averages: Scores;
  questionsCount: number;
  topics: string[];
}

export function MetricsSidebar({ open, onClose, averages, questionsCount, topics }: MetricsSidebarProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} />
      )}
      <aside
        className={`fixed right-0 top-0 z-40 h-full w-[300px] transform border-l border-border bg-surface p-5 transition-transform duration-150 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">Метрики</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <ProgressBar label="ТОЧНОСТЬ" value={averages.accuracy} />
          <ProgressBar label="ГЛУБИНА" value={averages.depth} />
          <ProgressBar label="ЯСНОСТЬ" value={averages.clarity} />
          <ProgressBar label="УВЕРЕННОСТЬ" value={averages.confidence} />
        </div>

        <div className="my-5 border-t border-border" />

        <p className="mb-2 text-xs text-text-secondary">Вопросов задано: {questionsCount}</p>
        <ol className="flex flex-col gap-1.5 text-xs text-text-primary">
          {topics.map((t, i) => (
            <li key={i}>
              {i + 1}. {t}
            </li>
          ))}
        </ol>
      </aside>
    </>
  );
}
