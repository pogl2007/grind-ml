import { SessionCard } from '@/components/history/SessionCard';
import type { InterviewSession } from '@/types';

interface SessionListProps {
  sessions: InterviewSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function SessionList({ sessions, activeId, onSelect }: SessionListProps) {
  return (
    <div className="flex flex-col gap-2">
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          active={s.id === activeId}
          onClick={() => onSelect(s.id)}
        />
      ))}
    </div>
  );
}
