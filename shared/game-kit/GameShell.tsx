'use client';

import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useT } from '@/shared/i18n/I18nProvider';

import { ExitConfirmDialog } from './ExitConfirmDialog';
import { GameErrorBoundary } from './GameErrorBoundary';
import { GameHeader } from './GameHeader';
import type { GameManifest } from './manifest';
import { RulesDialog } from './RulesDialog';
import type { GamePhase, RulesContent } from './types';

export interface GameShellProps {
  manifest: GameManifest;
  phase: GamePhase;
  onRestart?: () => void;
  rules?: RulesContent;
  onRulesOpenChange?: (open: boolean) => void;
  pausedOverlay?: boolean;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function GameShell({
  manifest,
  phase,
  onRestart,
  rules,
  onRulesOpenChange,
  pausedOverlay = true,
  headerActions,
  children,
}: GameShellProps) {
  const t = useT();
  const router = useRouter();
  const [exitOpen, setExitOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [boundaryKey, setBoundaryKey] = useState(0);
  const phaseLiveRef = useRef<HTMLDivElement>(null);
  const previousPhaseRef = useRef<GamePhase>(phase);

  const showRestart =
    Boolean(onRestart) && (phase === 'playing' || phase === 'paused' || phase === 'finished');

  useEffect(() => {
    if (previousPhaseRef.current === phase) {
      return;
    }
    previousPhaseRef.current = phase;
    if (phase !== 'paused' && phase !== 'finished') {
      return;
    }
    const message =
      phase === 'paused' ? t.gameKit.phase.paused : t.gameKit.phase.finished;
    if (phaseLiveRef.current) {
      phaseLiveRef.current.textContent = message;
    }
  }, [phase, t.gameKit.phase.finished, t.gameKit.phase.paused]);

  useEffect(() => {
    const needsGuard = phase === 'playing' || phase === 'paused';
    if (!needsGuard) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  const handleRulesOpen = () => {
    if (phase === 'playing') {
      onRulesOpenChange?.(true);
    }
    setRulesOpen(true);
  };

  const confirmExit = () => {
    setExitOpen(false);
    router.push('/');
  };

  const confirmRestart = () => {
    setRestartOpen(false);
    onRestart?.();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <a
        href="#game-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-ctl focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {t.nav.skipToGame}
      </a>

      <div ref={phaseLiveRef} className="sr-only" aria-live="polite" aria-atomic="true" />

      <GameHeader
        manifest={manifest}
        phase={phase}
        onCatalogNavigate={() => router.push('/')}
        onRequestExit={() => setExitOpen(true)}
        onRulesOpen={rules ? handleRulesOpen : undefined}
        showRules={Boolean(rules)}
        onRequestRestart={onRestart ? () => setRestartOpen(true) : undefined}
        showRestart={showRestart}
        headerActions={headerActions}
      />

      <main
        id="game-main"
        className="relative mx-auto w-full max-w-7xl flex-1 px-0 md:px-4"
      >
        <GameErrorBoundary
          key={boundaryKey}
          onReset={() => setBoundaryKey((value) => value + 1)}
        >
          {children}
        </GameErrorBoundary>

        {phase === 'paused' && pausedOverlay ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-fg/40"
            aria-hidden
          >
            <span className="rounded-card bg-surface px-6 py-3 text-lg font-bold text-fg shadow-card">
              {t.gameKit.pause}
            </span>
          </div>
        ) : null}
      </main>

      <ExitConfirmDialog
        open={exitOpen}
        onStay={() => setExitOpen(false)}
        onConfirm={confirmExit}
        title={t.gameKit.confirmExit.title}
        body={t.gameKit.confirmExit.body}
      />

      <ExitConfirmDialog
        open={restartOpen}
        onStay={() => setRestartOpen(false)}
        onConfirm={confirmRestart}
        title={t.gameKit.confirmRestart.title}
        body={t.gameKit.confirmRestart.body}
        confirmLabel={t.gameKit.restart}
      />

      {rules ? (
        <RulesDialog
          open={rulesOpen}
          onClose={() => {
            setRulesOpen(false);
            onRulesOpenChange?.(false);
          }}
          title={t.gameKit.rules}
          content={rules}
        />
      ) : null}
    </div>
  );
}
