'use client';

import { useMemo } from 'react';

import { useGameStore } from '@/games/alphabet/store';
import { VictoryScreen } from '@/shared/game-kit';

export function VictoryScreenContainer() {
  const { teamScores, settings, resetGame } = useGameStore();

  const ranking = useMemo(
    () =>
      settings.teamNames.slice(0, settings.teamsCount).map((name, index) => ({
        id: String(index),
        name,
        score: teamScores[index] ?? 0,
        colorIndex: index,
      })),
    [settings.teamNames, settings.teamsCount, teamScores],
  );

  return <VictoryScreen ranking={ranking} onPlayAgain={resetGame} />;
}
