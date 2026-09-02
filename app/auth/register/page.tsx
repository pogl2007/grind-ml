import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[400px] rounded border border-border bg-surface p-8">
        <div className="mb-6 text-center">
          <span className="font-mono-nums text-lg font-medium text-accent-text">GRIND ML</span>
        </div>
        <h1 className="mb-6 text-center text-base font-medium text-text-primary">Регистрация</h1>
        <RegisterForm />
        <p className="mt-6 text-center text-xs text-text-secondary">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-accent-text hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
