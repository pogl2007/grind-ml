'use client';

import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSend: (
    text: string,
    imageBase64: string | null,
    isCode: boolean,
    audioBase64?: string | null,
    audioMimeType?: string | null,
    audioUrl?: string | null
  ) => void;
  disabled?: boolean;
}

// Провайдер стабильно принимает WAV, а с webm/ogg из MediaRecorder периодически
// отказывается работать ("unsupported or malformed audio") — конвертируем на клиенте,
// чтобы не зависеть от того, какие контейнеры/кодеки он на самом деле поддерживает.
async function blobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextCtor();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;

  const interleaved = new Float32Array(numFrames * numChannels);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < numFrames; i++) {
      interleaved[i * numChannels + ch] = channelData[i];
    }
  }

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  await audioCtx.close();
  return new Blob([buffer], { type: 'audio/wav' });
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [codeMode, setCodeMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1] ?? null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function removeImage() {
    setImagePreview(null);
    setImageBase64(null);
  }

  function handleSend() {
    if (disabled) return;
    if (!text.trim() && !imageBase64) return;
    onSend(text.trim(), imageBase64, codeMode);
    setText('');
    removeImage();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  async function toggleRecording() {
    if (disabled) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      console.log('[voice] запрашиваю доступ к микрофону...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const candidates = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'];
      const mimeType = candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? 'audio/webm';
      console.log('[voice] доступ получен, mimeType записи:', mimeType, 'поддерживаемые варианты:', candidates.map((c) => `${c}=${MediaRecorder.isTypeSupported(c)}`));
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        console.log('[voice] ondataavailable, размер чанка:', e.data.size, 'байт');
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onerror = (e) => {
        console.error('[voice] ошибка MediaRecorder:', e);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const rawBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('[voice] запись остановлена. Чанков:', audioChunksRef.current.length, 'исходный blob:', rawBlob.size, 'байт, тип:', rawBlob.type);

        let wavBlob: Blob;
        try {
          const t0 = performance.now();
          wavBlob = await blobToWav(rawBlob);
          console.log('[voice] конвертация в WAV успешна за', Math.round(performance.now() - t0), 'мс. WAV размер:', wavBlob.size, 'байт');
        } catch (err) {
          console.error('[voice] не удалось сконвертировать в WAV, отправляю как есть (', mimeType, '):', err);
          wavBlob = rawBlob;
        }

        const reader = new FileReader();
        reader.onerror = () => {
          console.error('[voice] FileReader.onerror при чтении blob в base64:', reader.error);
        };
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] ?? null;
          console.log('[voice] base64 готов, длина:', base64?.length ?? 0, 'символов. Отправляю на сервер (тип:', wavBlob.type, ')');
          if (base64) onSend('', null, false, base64, wavBlob.type, result);
        };
        reader.readAsDataURL(wavBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      console.log('[voice] запись началась');
    } catch (err) {
      console.error('[voice] не удалось получить доступ к микрофону:', err);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  return (
    <div className="border-t border-border bg-bg px-4 py-3">
      <div className="mx-auto flex max-w-[760px] flex-col gap-2">
        {imagePreview && (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Превью"
              className="max-h-32 rounded border border-border-strong"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-border-strong text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-hover"
            title="Прикрепить фото"
          >
            📎
          </button>
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border transition-colors duration-150 ease-out disabled:opacity-50 ${
              isRecording
                ? 'border-danger bg-danger/10 text-danger animate-pulse'
                : 'border-border-strong text-text-secondary hover:bg-surface-hover'
            }`}
            title={isRecording ? 'Остановить запись' : 'Голосовое сообщение'}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
          <button
            type="button"
            onClick={() => setCodeMode((v) => !v)}
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border font-mono-nums text-xs transition-colors duration-150 ease-out ${
              codeMode
                ? 'border-accent bg-accent-subtle text-accent-text'
                : 'border-border-strong text-text-secondary hover:bg-surface-hover'
            }`}
            title="Режим кода"
          >
            {'</>'}
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Введите ответ..."
            disabled={disabled}
            className={`max-h-[200px] flex-1 resize-none rounded border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors duration-150 ease-out focus:border-accent disabled:opacity-50 ${
              codeMode ? 'font-mono-nums' : ''
            }`}
          />
          <Button onClick={handleSend} disabled={disabled || (!text.trim() && !imageBase64)}>
            Отправить
          </Button>
        </div>
        <p className="text-xs text-text-muted">Enter — отправить · Shift+Enter — новая строка</p>
      </div>
    </div>
  );
}
