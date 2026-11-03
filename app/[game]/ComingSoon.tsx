'use client';

import Link from 'next/link';

import type { ActiveLocale, GameManifest } from '@/shared/game-kit/manifest';
import { useLocale, useT } from '@/shared/i18n/I18nProvider';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';

import { GameTile } from '@/app/_components/GameTile';

export interface ComingSoonProps {
  manifest: GameManifest;
}

export function ComingSoon({ manifest }: ComingSoonProps) {
  const locale = useLocale() as ActiveLocale;
  const t = useT();

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center gap-6 px-4 py-12 text-center md:px-6">
      <div className="w-full max-w-sm">
        <GameTile tile={manifest.tile} />
      </div>
      <Badge variant="accent">{t.catalog.comingSoon}</Badge>
      <h1 className="text-2xl font-bold text-fg">{manifest.title[locale]}</h1>
      <p className="text-base text-fg-muted">{manifest.description[locale]}</p>
      <Link
        href="/"
        className={cn(
          'inline-flex h-12 min-h-12 items-center justify-center rounded-ctl bg-primary px-5 text-base font-semibold text-primary-fg shadow-card',
          'transition-transform hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus',
        )}
      >
        {t.nav.home}
      </Link>
    </main>
  );
}
