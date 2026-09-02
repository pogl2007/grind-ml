'use client';

import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const PRO_BENEFITS = [
  'Все уровни: Junior, Middle, Senior',
  'Все темы: Classical ML, DL, SQL, System Design, Stats',
  'Все компании: Яндекс, Сбер, VK, Тинькофф, Озон',
  'Безлимитные сессии',
  'Полная история сессий',
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: 'limit' | 'feature';
}

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={reason === 'limit' ? 'Лимит на сегодня исчерпан' : 'Эта функция доступна в PRO'}
    >
      <ul className="mb-6 flex flex-col gap-2 text-sm text-text-secondary">
        {PRO_BENEFITS.map((b) => (
          <li key={b}>✓ {b}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button
          fullWidth
          onClick={() => {
            router.push('/subscription');
          }}
        >
          Перейти на PRO
        </Button>
        <Button variant="outline" fullWidth onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </Modal>
  );
}
