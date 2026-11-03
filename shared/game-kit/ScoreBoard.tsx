'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';

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
}

export function ScoreBoard({ teams, activeTeamId, modeLabel }: ScoreBoardProps) {
  const liveRef = useRef<HTMLDivElement>(null);
  const previousSummaryRef = useRef('');

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

  return (
    <div className="border-b border-border bg-surface px-4 py-4 shadow-card">
      <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      {modeLabel ? (
        <p className="mb-3 text-sm font-semibold text-fg-muted">{modeLabel}</p>
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
                'flex min-w-[9rem] flex-col items-center rounded-card px-3 py-3 shadow-card',
                isActive
                  ? 'bg-accent text-accent-fg ring-2 ring-primary'
                  : colorClass,
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
  );
}
