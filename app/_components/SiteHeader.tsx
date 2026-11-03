import Link from 'next/link';

import { SITE } from '@/shared/config/site';
import { LocaleSwitcher } from '@/shared/i18n/LocaleSwitcher';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-4 md:px-6 xl:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-3 rounded-ctl text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-fg"
          >
            C
          </span>
          <span className="text-base font-bold">{SITE.name}</span>
        </Link>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
