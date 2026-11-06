'use client';

import Link from 'next/link';
import { BookOpen, MoreHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';

import { LocaleSwitcher } from '@/shared/i18n/LocaleSwitcher';
import { useLocale, useT } from '@/shared/i18n/I18nProvider';
import { IconButton } from '@/shared/ui/IconButton';

import type { GameManifest } from './manifest';
import type { GamePhase } from './types';

export interface GameHeaderProps {
  manifest: GameManifest;
  phase: GamePhase;
  onCatalogNavigate: () => void;
  onRequestExit: () => void;
  onRulesOpen?: () => void;
  showRules: boolean;
  onRequestRestart?: () => void;
  showRestart: boolean;
  headerActions?: ReactNode;
}

export function GameHeader({
  manifest,
  phase,
  onCatalogNavigate,
  onRequestExit,
  onRulesOpen,
  showRules,
  onRequestRestart,
  showRestart,
  headerActions,
}: GameHeaderProps) {
  const locale = useLocale();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const title = manifest.title[locale];
  const needsExitConfirm = phase === 'playing' || phase === 'paused';

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const handlePointer = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [menuOpen]);

  const handleCatalogClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (needsExitConfirm) {
      event.preventDefault();
      onRequestExit();
      return;
    }
    onCatalogNavigate();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 md:gap-3">
        <Link
          href="/"
          onClick={handleCatalogClick}
          className="inline-flex min-h-10 min-w-10 shrink-0 items-center gap-1 rounded-ctl px-2 text-sm font-semibold text-primary hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{t.gameKit.catalogLink}</span>
        </Link>

        <h1 className="min-w-0 flex-1 truncate text-base font-bold text-fg md:text-lg">
          {title}
        </h1>

        {showRules && onRulesOpen ? (
          <IconButton
            aria-label={t.gameKit.rules}
            className="shrink-0"
            onClick={onRulesOpen}
          >
            <BookOpen className="size-5" aria-hidden />
          </IconButton>
        ) : null}

        <LocaleSwitcher className="shrink-0" />

        <div className="relative shrink-0" ref={menuRef}>
          {(showRestart && onRequestRestart) || headerActions ? (
            <>
              <IconButton
                aria-label={t.gameKit.restart}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreHorizontal className="size-5" aria-hidden />
              </IconButton>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-ctl border border-border bg-surface p-2 shadow-card"
                >
                  {showRestart && onRequestRestart ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full min-h-11 items-center rounded-ctl px-3 text-left text-sm font-semibold text-fg hover:bg-bg"
                      onClick={() => {
                        setMenuOpen(false);
                        onRequestRestart();
                      }}
                    >
                      {t.gameKit.restart}
                    </button>
                  ) : null}
                  {headerActions}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
