'use client';

import { Flag, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useT } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';

import { ExitConfirmDialog } from './ExitConfirmDialog';
import type { ScoreTeam } from './types';

const TEAM_DOT_CLASSES = [
  'bg-team-1',
  'bg-team-2',
  'bg-team-3',
  'bg-team-4',
  'bg-team-5',
  'bg-team-6',
] as const;

export interface ScoreBoardProps {
  teams: ScoreTeam[];
  activeTeamId?: string;
  modeLabel?: string;
  paused?: boolean;
  onTogglePause?: () => void;
  pauseLabel?: string;
  resumeLabel?: string;
  onFinish?: () => void;
  finishLabel?: string;
  finishConfirm?: string;
  hideControls?: boolean;
}

export function ScoreBoard({
  teams,
  activeTeamId,
  modeLabel,
  paused,
  onTogglePause,
  pauseLabel,
  resumeLabel,
  onFinish,
  finishLabel,
  finishConfirm,
  hideControls,
}: ScoreBoardProps) {
  const t = useT();
  const liveRef = useRef<HTMLDivElement>(null);
  const previousSummaryRef = useRef('');
  const [finishOpen, setFinishOpen] = useState(false);

  useEffect(() => {
    const summary = teams
      .map((team) => `${team.name} ${team.score}`)
      .join(', ');
    if (summary === previousSummaryRef.current) {
      return;
    }
    previousSummaryRef.current = summary;
    if (liveRef.current) {
      liveRef.current.textContent = summary;
    }
  }, [teams]);

  const showControls = !hideControls && (onTogglePause || onFinish);

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-border bg-surface px-4 py-3">
        <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            {modeLabel ? (
              <p className="sr-only">{modeLabel}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
              {teams.map((team) => {
                const isActive = team.id === activeTeamId;
                const dotClass =
                  TEAM_DOT_CLASSES[team.colorIndex % TEAM_DOT_CLASSES.length];
                return (
                  <div
                    key={team.id}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-ctl border px-2.5 py-1.5 transition-opacity',
                      isActive
                        ? 'border-transparent bg-accent text-accent-fg'
                        : 'border-border bg-surface text-fg',
                      paused ? 'opacity-60' : 'opacity-100',
                    )}
                  >
                    <span
                      className={cn('size-2 rounded-full', isActive ? 'bg-accent-fg' : dotClass)}
                      aria-hidden
                    />
                    <span className="max-w-[10rem] truncate text-sm font-semibold">{team.name}</span>
                    <span className="text-base font-bold tabular-nums">{team.score}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {showControls ? (
            <div className="flex shrink-0 gap-2">
              {onTogglePause ? (
                <Button
                  type="button"
                  variant={paused ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={onTogglePause}
                  aria-pressed={paused}
                >
                  {paused ? (
                    <>
                      <Play className="size-4" aria-hidden />
                      {resumeLabel ?? t.gameKit.playAgain}
                    </>
                  ) : (
                    <>
                      <Pause className="size-4" aria-hidden />
                      {pauseLabel ?? t.gameKit.pause}
                    </>
                  )}
                </Button>
              ) : null}
              {onFinish && finishLabel ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setFinishOpen(true)}>
                  <Flag className="size-4" aria-hidden />
                  {finishLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {onFinish && finishConfirm ? (
        <ExitConfirmDialog
          open={finishOpen}
          onStay={() => setFinishOpen(false)}
          onConfirm={() => {
            setFinishOpen(false);
            onFinish();
          }}
          title={finishLabel ?? t.gameKit.phase.finished}
          body={finishConfirm}
          confirmLabel={finishLabel}
        />
      ) : null}
    </>
  );
}
