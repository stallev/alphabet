'use client';

import Link from 'next/link';
import { Clock, Users } from 'lucide-react';

import type { GameManifest, GameTag } from '@/shared/game-kit/manifest';
import { useLocale, useT } from '@/shared/i18n/I18nProvider';
import { plural } from '@/shared/i18n/plural';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';

import { GameTile } from './GameTile';

export interface GameCardProps {
  manifest: GameManifest;
}

export function GameCard({ manifest }: GameCardProps) {
  const locale = useLocale();
  const t = useT();
  const isComingSoon = manifest.status === 'coming-soon';
  const tags = manifest.tags.slice(0, 3);

  const teamsLabel = plural(locale, t.catalog.teams, manifest.teams.max)
    .replace('{min}', String(manifest.teams.min))
    .replace('{max}', String(manifest.teams.max));

  const durationLabel =
    manifest.durationMinutes != null
      ? `${manifest.durationMinutes.min}–${manifest.durationMinutes.max} ${t.catalog.minutes.replace('{count}', String(manifest.durationMinutes.max))}`
      : null;

  const body = (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow',
        !isComingSoon && 'hover:shadow-press focus-within:ring-2 focus-within:ring-ring',
        isComingSoon && 'opacity-80',
      )}
      aria-disabled={isComingSoon || undefined}
    >
      <GameTile tile={manifest.tile} muted={isComingSoon} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 text-lg font-bold text-fg">{manifest.title[locale]}</h2>
          {isComingSoon ? <Badge variant="accent">{t.catalog.comingSoon}</Badge> : null}
        </div>
        <p className="line-clamp-2 text-sm text-fg-muted">{manifest.tagline[locale]}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag}>{t.catalog.tags[tag as GameTag]}</Badge>
          ))}
        </div>
        <p className="mt-auto flex flex-wrap items-center gap-3 text-xs font-semibold text-fg-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="size-4" aria-hidden />
            {teamsLabel}
          </span>
          {durationLabel ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" aria-hidden />
              {durationLabel}
            </span>
          ) : null}
          {manifest.minAge != null ? (
            <span>{t.catalog.age.replace('{minAge}', String(manifest.minAge))}</span>
          ) : null}
        </p>
        {!isComingSoon ? (
          <span className="sr-only">{t.catalog.play}</span>
        ) : null}
      </div>
    </article>
  );

  if (isComingSoon) {
    return body;
  }

  return (
    <Link
      href={`/${manifest.slug}`}
      className="block h-full rounded-card focus-visible:outline-none"
    >
      {body}
    </Link>
  );
}
