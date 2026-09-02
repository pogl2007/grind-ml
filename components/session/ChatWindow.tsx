'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/session/ChatMessage';
import { StreamingIndicator } from '@/components/session/StreamingIndicator';
import { RobotAvatar } from '@/components/session/RobotAvatar';
import type { Message } from '@/types';

interface ChatWindowProps {
  messages: (Message & { imagePreview?: string | null; audioPreview?: string | null; isCode?: boolean })[];
  streamingText: string;
  isStreaming: boolean;
}

export function ChatWindow({ messages, streamingText, isStreaming }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const displayStreamingText = streamingText.split(' __META__')[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-6">
      {messages.map((m) => (
        <ChatMessage
          key={m.id}
          role={m.role}
          content={m.content}
          scores={m.scores}
          imagePreview={m.imagePreview}
          audioPreview={m.audioPreview}
          isCode={m.isCode}
        />
      ))}

      {isStreaming && (
        <div className="flex gap-3">
          <RobotAvatar active />
          <div className="max-w-[85%] rounded border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-text-primary">
            {displayStreamingText || <StreamingIndicator />}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
