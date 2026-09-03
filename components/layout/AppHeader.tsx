'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LogoIcon } from '@/components/layout/LogoIcon';

const BASE_NAV_ITEMS = [
  { href: '/profile', label: 'Главное меню' },
  { href: '/history', label: 'История' },
  { href: '/', label: 'На главную' },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const plan = (user as { plan?: string } | null)?.plan ?? 'FREE';
  const isAdmin = Boolean((user as { isAdmin?: boolean } | null)?.isAdmin);
  const NAV_ITEMS = isAdmin ? [...BASE_NAV_ITEMS, { href: '/admin', label: 'Админка' }] : BASE_NAV_ITEMS;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/profile" className="flex items-center gap-2 font-mono-nums text-sm font-medium text-accent-text">
            <LogoIcon className="h-6 w-6" />
            GRIND ML
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`rounded px-3 py-1.5 text-sm transition-colors duration-150 ease-out ${
                      active
                        ? 'bg-surface-hover text-text-primary'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {plan === 'PRO' && <Badge tone="accent">PRO ✦</Badge>}
          <Link href="/setup">
            <Button size="sm">Новая сессия</Button>
          </Link>
          <Link
            href="/profile"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-xs text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-hover"
            title="Личный кабинет"
          >
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
            Выйти
          </Button>
        </div>
      </div>

      <nav className="flex items-center gap-1 border-t border-border px-4 py-1.5 sm:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={`rounded px-2.5 py-1 text-xs transition-colors duration-150 ease-out ${
                  active ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
