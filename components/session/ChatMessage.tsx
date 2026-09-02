import { ScoreBadge } from '@/components/session/ScoreBadge';
import { RobotAvatar } from '@/components/session/RobotAvatar';
import type { Scores } from '@/types';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  scores?: Scores | null;
  imagePreview?: string | null;
  audioPreview?: string | null;
  isCode?: boolean;
}

export function ChatMessage({ role, content, scores, imagePreview, audioPreview, isCode }: ChatMessageProps) {
  const isUser = role === 'user';
  // Защита от утечки служебного __META__-суффикса в текст сообщения
  // (например, если старое сообщение в БД/локальном состоянии сохранилось до фикса парсинга).
  const displayContent = content.split(' __META__')[0].trimEnd();

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <RobotAvatar />}
      <div className={`flex max-w-[85%] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt="Прикреплённое изображение"
            className="max-h-48 rounded border border-border-strong"
          />
        )}
        {audioPreview && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={audioPreview} controls className="h-10 max-w-full" />
        )}
        <div
          className={`rounded border px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'border-accent bg-accent-subtle text-text-primary'
              : 'border-border bg-surface text-text-primary'
          } ${isCode ? 'font-mono-nums whitespace-pre-wrap' : 'whitespace-pre-wrap'}`}
        >
          {displayContent}
        </div>
        {!isUser && scores && (
          <div className="flex flex-wrap gap-1.5">
            <ScoreBadge label="Точность" value={scores.accuracy} />
            <ScoreBadge label="Глубина" value={scores.depth} />
            <ScoreBadge label="Ясность" value={scores.clarity} />
            <ScoreBadge label="Уверенность" value={scores.confidence} />
          </div>
        )}
      </div>
    </div>
  );
}
