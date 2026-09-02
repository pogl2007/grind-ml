'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LogoIcon } from '@/components/layout/LogoIcon';

export function Navbar() {
  const { user, isAuthenticated } = useCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-mono-nums text-base font-medium text-accent-text">
          <LogoIcon className="h-7 w-7" />
          GRIND ML
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {(user as { plan?: string })?.plan === 'PRO' && (
              <Badge tone="accent">PRO ✦</Badge>
            )}
            <Link href="/profile">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong bg-surface text-xs text-text-secondary">
                {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
            </Link>
            <Link href="/setup">
              <Button size="sm">Начать сессию</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Войти
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Начать бесплатно</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
