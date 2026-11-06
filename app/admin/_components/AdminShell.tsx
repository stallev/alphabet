'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminSignOutButton } from '@/app/admin/_components/AdminSignOutButton';
import { cn } from '@/shared/lib/cn';

const NAV_ITEMS = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/suites', label: 'Наборы вопросов' },
  { href: '/admin/suites/import', label: 'Импорт JSON' },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith('/admin/login');

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed left-0 top-0 z-50 flex h-full w-56 flex-col border-r border-border bg-surface">
        <div className="border-b border-border p-5">
          <span className="text-sm font-bold text-fg">Алфавит Admin</span>
          <div className="mt-1 text-xs text-fg-muted">System Console</div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-ctl px-3 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-fg'
                    : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/alphabet"
            className="mt-4 block border-t border-border pt-4 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
          >
            ← Игра
          </Link>
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <Link
            href="/admin/login"
            className="block rounded-ctl px-3 py-2 text-xs font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
          >
            Страница входа
          </Link>
          <AdminSignOutButton />
        </div>
      </aside>

      <main className="ml-56 min-h-dvh">{children}</main>
    </div>
  );
}
