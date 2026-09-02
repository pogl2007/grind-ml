import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[400px] rounded border border-border bg-surface p-8">
        <div className="mb-6 text-center">
          <span className="font-mono-nums text-lg font-medium text-accent-text">GRIND ML</span>
        </div>
        <h1 className="mb-6 text-center text-base font-medium text-text-primary">Вход</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-text-secondary">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="text-accent-text hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
