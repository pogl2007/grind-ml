'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InterviewSession } from '@/types';

interface ProgressChartProps {
  sessions: InterviewSession[];
}

interface ChartTooltipPayloadItem {
  payload: { date: string; company: string; score: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: ChartTooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded border border-border-strong bg-surface px-3 py-2 text-xs">
      <div className="text-text-secondary">{point.date}</div>
      <div className="text-text-primary">{point.company}</div>
      <div className="font-mono-nums text-accent-text">{point.score}</div>
    </div>
  );
}

export function ProgressChart({ sessions }: ProgressChartProps) {
  const data = [...sessions]
    .filter((s) => s.overallScore !== null)
    .reverse()
    .map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      company: s.company,
      score: s.overallScore ?? 0,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded border border-border bg-surface text-sm text-text-secondary">
        Пока недостаточно данных для графика
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#7d8590" fontSize={12} />
          <YAxis domain={[0, 100]} stroke="#7d8590" fontSize={12} />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#238636"
            strokeWidth={2}
            dot={{ r: 4, fill: '#238636' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
