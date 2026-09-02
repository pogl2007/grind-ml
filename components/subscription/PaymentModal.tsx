'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

type Stage = 'form' | 'loading' | 'success';

export function PaymentModal({ open, onClose }: PaymentModalProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  async function handlePay() {
    setStage('loading');

    await fetch('/api/subscription/activate', { method: 'POST' });

    setTimeout(() => {
      setStage('success');
      setTimeout(() => {
        router.push('/setup');
        router.refresh();
      }, 2000);
    }, 2000);
  }

  function handleClose() {
    if (stage === 'loading') return;
    setStage('form');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardName('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Оплата PRO подписки" width={420}>
      {stage === 'form' && (
        <div className="flex flex-col gap-4">
          <p className="font-mono-nums text-2xl text-text-primary">199 ₽ / месяц</p>
          <Input
            label="Номер карты"
            placeholder="____ ____ ____ ____"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <div className="flex gap-3">
            <Input
              label="Срок"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <Input
              label="CVV"
              placeholder="___"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
          <Input
            label="Имя на карте"
            placeholder="IVAN IVANOV"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
          <Button fullWidth onClick={handlePay}>
            Оплатить 199 ₽
          </Button>
          <p className="text-center text-xs text-text-muted">
            Тестовый режим оплаты · Реальные платежи не проводятся
          </p>
        </div>
      )}

      {stage === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
          <p className="text-sm text-text-secondary">Обрабатываем платёж...</p>
        </div>
      )}

      {stage === 'success' && (
        <div className="flex flex-col items-center gap-2 py-8">
          <p className="text-lg text-accent-text">✓ PRO активирован!</p>
        </div>
      )}
    </Modal>
  );
}
