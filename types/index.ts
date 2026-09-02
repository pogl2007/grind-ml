export type Plan = 'FREE' | 'PRO';

export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export type Company = 'Яндекс' | 'Сбер' | 'VK' | 'Тинькофф' | 'Озон';

export type Topic =
  | 'classical_ml'
  | 'deep_learning'
  | 'sql'
  | 'system_design'
  | 'stats';

export type Level = 'junior' | 'middle' | 'senior';

export type Verdict = 'hire' | 'reservations' | 'not_yet';

export interface Scores {
  accuracy: number;
  depth: number;
  clarity: number;
  confidence: number;
}

export interface StudyTopic {
  topic: string;
  url: string;
}

export interface FinalReport {
  verdict: Verdict;
  strong: string[];
  weak: string[];
  study: StudyTopic[];
  summary: string;
}

export interface SessionConfig {
  company: Company;
  topic: Topic;
  level: Level;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  planExpiresAt: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  hasImage: boolean;
  scores: Scores | null;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  company: string;
  topic: string;
  level: string;
  model: string;
  status: SessionStatus;
  verdict: Verdict | null;
  overallScore: number | null;
  summary: string | null;
  strongSides: string[];
  weakSides: string[];
  studyTopics: StudyTopic[] | null;
  messages?: Message[];
  createdAt: string;
  completedAt: string | null;
}

export const COMPANIES: Company[] = ['Яндекс', 'Сбер', 'VK', 'Тинькофф', 'Озон'];

export const COMPANY_DESCRIPTIONS: Record<Company, string> = {
  Яндекс: 'математика · теория · edge cases',
  Сбер: 'практика · продакшн · масштаб',
  VK: 'алгоритмы · рекомендации · highload',
  Тинькофф: 'метрики · бизнес · финансы',
  Озон: 'A/B тесты · ранжирование · e-commerce',
};

export const TOPICS: { value: Topic; label: string }[] = [
  { value: 'classical_ml', label: 'Classical ML' },
  { value: 'deep_learning', label: 'Deep Learning' },
  { value: 'sql', label: 'SQL' },
  { value: 'system_design', label: 'System Design' },
  { value: 'stats', label: 'Statistics' },
];

export const LEVELS: { value: Level; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
];

export const FREE_LIMITS = {
  companies: ['Яндекс'] as Company[],
  topics: ['classical_ml', 'sql'] as Topic[],
  levels: ['junior'] as Level[],
  maxSessionsPerDay: 2,
  maxHistoryItems: 5,
};
