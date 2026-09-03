'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'PRO';
  planExpiresAt: string | null;
  isAdmin: boolean;
  createdAt: string;
  _count: { sessions: number };
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/users')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Не удалось загрузить список');
        }
        return res.json();
      })
      .then((data: AdminUser[]) => {
        setUsers(data);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка'));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(userId: string, patch: { plan?: 'FREE' | 'PRO'; isAdmin?: boolean }) {
    setPendingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось обновить');

      setUsers((prev) =>
        prev
          ? prev.map((u) => (u.id === userId ? { ...u, plan: data.plan, isAdmin: data.isAdmin } : u))
          : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setPendingId(null);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <AppHeader />
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-text-secondary">
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  if (!users) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-secondary">
        Загрузка...
      </div>
    );
  }

  const totalPro = users.filter((u) => u.plan === 'PRO').length;

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-1 text-xl font-medium text-text-primary">Админ-панель</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Пользователей: {users.length} · на PRO: {totalPro}
        </p>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3 font-medium">Пользователь</th>
                <th className="px-4 py-3 font-medium">Сессий</th>
                <th className="px-4 py-3 font-medium">Регистрация</th>
                <th className="px-4 py-3 font-medium">План</th>
                <th className="px-4 py-3 font-medium">Админ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-text-primary">{u.name || '—'}</div>
                    <div className="text-xs text-text-muted">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono-nums text-text-secondary">{u._count.sessions}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={u.plan === 'PRO' ? 'accent' : 'muted'}>{u.plan}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendingId === u.id}
                        onClick={() => updateUser(u.id, { plan: u.plan === 'PRO' ? 'FREE' : 'PRO' })}
                      >
                        {u.plan === 'PRO' ? 'Снять PRO' : 'Выдать PRO'}
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.isAdmin && <Badge tone="warning">ADMIN</Badge>}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pendingId === u.id}
                        onClick={() => updateUser(u.id, { isAdmin: !u.isAdmin })}
                      >
                        {u.isAdmin ? 'Снять' : 'Назначить'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
