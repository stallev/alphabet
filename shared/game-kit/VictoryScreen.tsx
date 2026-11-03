'use client';

import { useT } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

import { Confetti } from './Confetti';
import { rankTeams } from './rank-teams';
import type { ScoreTeam } from './types';

export interface VictoryScreenProps {
  ranking: ScoreTeam[];
  onPlayAgain: () => void;
  onExit?: () => void;
}

export function VictoryScreen({ ranking, onPlayAgain, onExit }: VictoryScreenProps) {
  const t = useT();
  const ranked = rankTeams(ranking);
  const topRank = ranked[0]?.rank ?? 1;
  const winners = ranked.filter((team) => team.rank === topRank);
  const isTie = winners.length > 1;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-fg/80 p-4">
      <Confetti />
      <div className="relative z-10 w-full max-w-lg rounded-card border border-border bg-surface p-8 shadow-card">
        <h2 className="text-center text-3xl font-extrabold text-fg">
          {isTie ? t.gameKit.victory.tieTitle : t.gameKit.victory.title}
        </h2>
        {!isTie && winners[0] ? (
          <p className="mt-2 text-center text-fg-muted">
            {t.gameKit.victory.winner.replace('{name}', winners[0].name)}
          </p>
        ) : null}
        {isTie ? (
          <p className="mt-2 text-center text-sm font-semibold text-fg-muted">
            {winners.map((team) => team.name).join(', ')}
          </p>
        ) : null}

        <ol className="mt-8 flex flex-col gap-3">
          {ranked.map((team) => (
            <li
              key={team.id}
              className={cn(
                'flex items-center justify-between rounded-ctl px-4 py-3',
                team.rank === topRank ? 'bg-accent text-accent-fg' : 'bg-bg text-fg',
              )}
            >
              <span className="font-bold">
                {team.rank}. {team.name}
              </span>
              <span className="text-xl font-extrabold tabular-nums">{team.score}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" size="lg" onClick={onPlayAgain}>
            {t.gameKit.playAgain}
          </Button>
          {onExit ? (
            <Button className="flex-1" size="lg" variant="secondary" onClick={onExit}>
              {t.gameKit.exit}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
