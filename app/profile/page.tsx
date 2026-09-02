'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressChart } from '@/components/history/ProgressChart';
import type { InterviewSession } from '@/types';

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  planExpiresAt: string | null;
  stats: {
    totalSessions: number;
    avgScore: number;
    best: { score: number | null; company: string; topic: string } | null;
  };
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-text-muted';
  if (score < 60) return 'text-danger';
  if (score <= 80) return 'text-warning';
  return 'text-accent-text';
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setName(data.name ?? '');
      });
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data: InterviewSession[]) => setSessions(data));
  }, []);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setNameSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setNameSaving(false);
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('Минимум 8 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setPasswordSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    setPasswordSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setPasswordError(data.error);
      return;
    }

    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-secondary">
        Загрузка...
      </div>
    );
  }

  const isPro = profile.plan === 'PRO';
  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-text to-accent-3 text-xl font-medium text-bg">
              {profile.name?.[0]?.toUpperCase() ?? profile.email[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-medium text-text-primary">
                {profile.name || profile.email}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge tone={isPro ? 'accent' : 'muted'}>{isPro ? 'PRO ✦' : 'FREE'}</Badge>
                {isPro && profile.planExpiresAt && (
                  <span className="text-xs text-text-muted">
                    активен до {new Date(profile.planExpiresAt).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link href="/setup">
            <Button size="lg">Новая сессия →</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <Card className="p-4">
            <div className="text-xs text-text-secondary">Сессий пройдено</div>
            <div className="font-mono-nums mt-1 text-2xl text-text-primary">
              {profile.stats.totalSessions}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-text-secondary">Средний скор</div>
            <div className={`font-mono-nums mt-1 text-2xl ${scoreColor(profile.stats.avgScore)}`}>
              {profile.stats.avgScore || '—'}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-text-secondary">Лучший результат</div>
            <div
              className={`font-mono-nums mt-1 text-2xl ${scoreColor(profile.stats.best?.score ?? null)}`}
            >
              {profile.stats.best?.score ?? '—'}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-text-secondary">Тариф</div>
            <div className="mt-1 text-2xl text-text-primary">{isPro ? 'PRO' : 'FREE'}</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="mb-3 text-sm font-medium text-text-primary">Динамика прогресса</h3>
          <ProgressChart sessions={sessions} />
        </motion.div>

        {recentSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">Недавние сессии</h3>
              <Link href="/history" className="text-xs text-accent-text hover:underline">
                Вся история →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentSessions.map((s) => (
                <Link key={s.id} href={`/report/${s.id}`}>
                  <Card className="flex items-center justify-between p-4" hoverable>
                    <div className="flex items-center gap-2">
                      <Badge>{s.company}</Badge>
                      <Badge>{s.topic}</Badge>
                      <span className="text-xs text-text-muted">
                        {new Date(s.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <span className={`font-mono-nums text-sm ${scoreColor(s.overallScore)}`}>
                      {s.overallScore ?? '—'}
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="flex flex-wrap items-center justify-between gap-3 border-accent-2 p-5">
              <div>
                <div className="text-sm font-medium text-text-primary">Хочешь больше?</div>
                <div className="text-xs text-text-secondary">
                  PRO открывает все компании, темы, уровни и безлимитные сессии
                </div>
              </div>
              <Link href="/subscription">
                <Button>Перейти на PRO</Button>
              </Link>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            <span className={`transition-transform duration-150 ${showSettings ? 'rotate-90' : ''}`}>
              ›
            </span>
            Настройки аккаунта
          </button>

          {showSettings && (
            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <form onSubmit={handleSaveName} className="flex flex-col gap-4">
                  <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input label="Email" value={profile.email} disabled />
                  <Button type="submit" disabled={nameSaving} className="self-start">
                    {nameSaving ? 'Сохраняем...' : 'Сохранить'}
                  </Button>
                </form>
              </Card>

              <Card className="p-5">
                {!showPasswordForm ? (
                  <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                    Сменить пароль
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                    <Input
                      label="Текущий пароль"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <Input
                      label="Новый пароль"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      label="Подтверждение нового пароля"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {passwordError && <span className="text-xs text-danger">{passwordError}</span>}
                    {passwordSuccess && (
                      <span className="text-xs text-accent-text">Пароль изменён</span>
                    )}
                    <Button type="submit" disabled={passwordSaving} className="self-start">
                      {passwordSaving ? 'Сохраняем...' : 'Сохранить пароль'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
