'use client';

import { useMemo } from 'react';

import { useGameStore } from '@/games/alphabet/store';
import { GameMode } from '@/games/alphabet/types';
import { useGameT } from '@/games/alphabet/i18n/use-game-t';
import { ScoreBoard } from '@/shared/game-kit';

export function ScoreBoardContainer() {
  const t = useGameT();
  const {
    settings,
    teamScores,
    currentTeamIndex,
    finishGame,
    isGameOver,
    isPaused,
    togglePause,
  } = useGameStore();

  const teams = useMemo(
    () =>
      settings.teamNames.slice(0, settings.teamsCount).map((name, index) => ({
        id: String(index),
        name,
        score: teamScores[index] ?? 0,
        colorIndex: index,
      })),
    [settings.teamNames, settings.teamsCount, teamScores],
  );

  const modeLabel = `${t.mode}: ${
    settings.gameMode === GameMode.WITH_QUESTIONS ? t.withQuestions : t.withoutQuestions
  }`;

  return (
    <ScoreBoard
      teams={teams}
      activeTeamId={isGameOver ? undefined : String(currentTeamIndex)}
      modeLabel={modeLabel}
      paused={isPaused}
      onTogglePause={isGameOver ? undefined : togglePause}
      pauseLabel={t.pause}
      resumeLabel={t.resume}
      onFinish={isGameOver ? undefined : finishGame}
      finishLabel={t.finish}
      finishConfirm={t.finishConfirm}
      hideControls={isGameOver}
    />
  );
}
