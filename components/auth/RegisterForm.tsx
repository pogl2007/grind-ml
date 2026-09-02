'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const nextErrors: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Некорректный email';
    }
    if (password.length < 8) {
      nextErrors.password = 'Минимум 8 символов';
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ [data.field ?? 'general']: data.error });
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Не удалось войти автоматически' });
        setLoading(false);
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch {
      setErrors({ general: 'Что-то пошло не так' });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Имя (опционально)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Иван"
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        error={errors.email}
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Минимум 8 символов"
        error={errors.password}
      />
      <Input
        label="Подтверждение пароля"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Повторите пароль"
        error={errors.confirmPassword}
      />
      {errors.general && <span className="text-xs text-danger">{errors.general}</span>}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}
