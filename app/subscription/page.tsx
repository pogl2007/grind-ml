'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { PlanCard } from '@/components/subscription/PlanCard';
import { PaymentModal } from '@/components/subscription/PaymentModal';

const FREE_ITEMS = [
  'Уровень: Junior',
  'Темы: Classical ML, SQL',
  'Компания: Яндекс',
  '2 сессии в день',
  'История: 5 сессий',
];

const PRO_ITEMS = [
  'Все уровни',
  'Все темы',
  'Все компании',
  'Безлимитные сессии',
  'Полная история',
  'Более мощная модель ИИ',
  'Значок PRO',
];

export default function SubscriptionPage() {
  const { user } = useCurrentUser();
  const [modalOpen, setModalOpen] = useState(false);
  const plan = (user as { plan?: string } | null)?.plan ?? 'FREE';
  const isPro = plan === 'PRO';

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-8 text-sm text-text-secondary">
          {isPro ? 'Вы на PRO плане' : 'Вы на бесплатном плане'}
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PlanCard
            name="FREE"
            price="0 ₽"
            items={FREE_ITEMS}
            action={
              <Button variant="outline" fullWidth disabled={!isPro}>
                {isPro ? 'Текущий план недоступен' : 'Ваш текущий план'}
              </Button>
            }
          />
          <PlanCard
            name="PRO"
            price="199 ₽ / мес"
            items={PRO_ITEMS}
            highlighted
            action={
              <Button fullWidth disabled={isPro} onClick={() => setModalOpen(true)}>
                {isPro ? 'Уже активен' : 'Перейти на PRO'}
              </Button>
            }
          />
        </div>
      </div>

      <PaymentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
