'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import type { ActiveLocale } from '@/shared/domain/locale';
import { ACTIVE_LOCALES } from '@/shared/domain/locale';
import { cn } from '@/shared/lib/cn';

import { setLocale } from './actions/set-locale';
import { useLocale } from './I18nProvider';

const LOCALE_LABELS: Record<ActiveLocale, string> = {
  ru: 'RU',
  en: 'EN',
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (locale: ActiveLocale) => {
    if (locale === currentLocale) {
      return;
    }
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        'inline-flex rounded-ctl border border-border bg-surface p-0.5',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {ACTIVE_LOCALES.map((locale) => {
        const isActive = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            className={cn(
              'h-9 min-h-9 rounded-ctl px-2.5 text-xs font-semibold tabular-nums transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-primary text-primary-fg'
                : 'text-fg-muted hover:bg-bg hover:text-fg',
            )}
            aria-pressed={isActive}
            disabled={isPending}
            onClick={() => handleSelect(locale)}
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
