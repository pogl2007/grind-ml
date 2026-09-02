'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { CompanySelector } from '@/components/setup/CompanySelector';
import { TopicSelector } from '@/components/setup/TopicSelector';
import { LevelSelector } from '@/components/setup/LevelSelector';
import { UpgradeModal } from '@/components/setup/UpgradeModal';
import { COMPANIES, TOPICS, LEVELS, FREE_LIMITS } from '@/types';
import type { Company, Level, Topic } from '@/types';

export default function SetupPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const plan = (user as { plan?: string } | null)?.plan ?? 'FREE';
  const isPro = plan === 'PRO';

  const [company, setCompany] = useState<Company | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<'limit' | 'feature'>('feature');

  const allowedCompanies = isPro ? COMPANIES : FREE_LIMITS.companies;
  const allowedTopics = isPro ? TOPICS.map((t) => t.value) : FREE_LIMITS.topics;
  const allowedLevels = isPro ? LEVELS.map((l) => l.value) : FREE_LIMITS.levels;

  const canStart = Boolean(company && topic && level && !submitting);

  async function handleStart() {
    if (!company || !topic || !level) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, topic, level }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalReason(data.code === 'DAILY_LIMIT' ? 'limit' : 'feature');
        setModalOpen(true);
        setSubmitting(false);
        return;
      }

      router.push(`/session?id=${data.sessionId}`);
    } catch {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-secondary">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />
      <div className="px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl"
        >
          <h1 className="mb-8 text-xl font-medium text-text-primary">
            Привет, {user?.name || user?.email}. Настроим интервью?
          </h1>

          <div className="flex flex-col gap-8">
            <CompanySelector value={company} onChange={setCompany} allowed={allowedCompanies} />
            <TopicSelector value={topic} onChange={setTopic} allowed={allowedTopics} />
            <LevelSelector value={level} onChange={setLevel} allowed={allowedLevels} />
          </div>

          <Button className="mt-10" fullWidth size="lg" disabled={!canStart} onClick={handleStart}>
            {submitting ? 'Запускаем...' : 'Начать интервью →'}
          </Button>
        </motion.div>
      </div>

      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} reason={modalReason} />
    </div>
  );
}
