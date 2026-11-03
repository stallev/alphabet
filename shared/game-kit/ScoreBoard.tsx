'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useT } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';

import { ExitConfirmDialog } from './ExitConfirmDialog';
import type { ScoreTeam } from './types';

const TEAM_SURFACE_CLASSES = [
  'bg-team-1 text-team-1-fg',
  'bg-team-2 text-team-2-fg',
  'bg-team-3 text-team-3-fg',
  'bg-team-4 text-team-4-fg',
  'bg-team-5 text-team-5-fg',
  'bg-team-6 text-team-6-fg',
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
      <div className="sticky top-0 z-30 border-b border-border bg-surface px-4 py-4 shadow-card">
        <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            {modeLabel ? (
              <p className="mb-2 text-xs font-semibold text-fg-muted">
                {modeLabel}
              </p>
            ) : null}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {teams.map((team) => {
                const isActive = team.id === activeTeamId;
                const colorClass =
                  TEAM_SURFACE_CLASSES[team.colorIndex % TEAM_SURFACE_CLASSES.length];
                return (
                  <div
                    key={team.id}
                    className={cn(
                      'flex min-w-[9rem] flex-col items-center rounded-card px-3 py-3 shadow-card transition-opacity',
                      isActive
                        ? 'bg-accent text-accent-fg ring-2 ring-primary'
                        : colorClass,
                      paused ? 'opacity-60' : 'opacity-100',
                    )}
                  >
                    <span className="text-xs font-semibold text-inherit opacity-80">
                      {isActive ? '●' : `#${team.colorIndex + 1}`}
                    </span>
                    <span className="mt-1 max-w-full truncate text-base font-bold">{team.name}</span>
                    <span className="mt-1 text-2xl font-extrabold tabular-nums">{team.score}</span>
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
                  variant={paused ? 'primary' : 'secondary'}
                  size="md"
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
                <Button type="button" variant="secondary" size="md" onClick={() => setFinishOpen(true)}>
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
