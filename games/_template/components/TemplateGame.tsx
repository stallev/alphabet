'use client';

import { useMemo, useState } from 'react';

import { TEMPLATE_MANIFEST } from '@/games/_template/manifest-data';
import { useGameT } from '@/games/_template/i18n/use-game-t';
import {
  addTeamScore,
  createInitialScores,
} from '@/games/_template/logic/scoring';
import {
  GameShell,
  RulesDialog,
  ScoreBoard,
  SettingsPanel,
  TeamsSetup,
  VictoryScreen,
  type GamePhase,
  type ScoreTeam,
} from '@/shared/game-kit';
import { Button } from '@/shared/ui/Button';

export function TemplateGame() {
  const t = useGameT();
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [teamsSetup, setTeamsSetup] = useState({
    count: TEMPLATE_MANIFEST.teams.min,
    names: ['', ''],
  });
  const [scores, setScores] = useState<number[]>(() =>
    createInitialScores(TEMPLATE_MANIFEST.teams.min),
  );
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  const scoreTeams: ScoreTeam[] = useMemo(
    () =>
      teamsSetup.names.slice(0, teamsSetup.count).map((name, index) => ({
        id: String(index),
        name: name.trim() || `Team ${index + 1}`,
        score: scores[index] ?? 0,
        colorIndex: index,
      })),
    [scores, teamsSetup.count, teamsSetup.names],
  );

  const handleStart = () => {
    setScores(createInitialScores(teamsSetup.count));
    setActiveTeamIndex(0);
    setPhase('playing');
  };

  const handleScore = () => {
    setScores((prev) => addTeamScore(prev, activeTeamIndex));
  };

  const handleFinish = () => {
    setPhase('finished');
  };

  const handlePlayAgain = () => {
    setPhase('lobby');
  };

  return (
    <>
      <GameShell
        manifest={TEMPLATE_MANIFEST}
        phase={phase}
        rules={t.rules}
        onRulesOpenChange={setRulesOpen}
        onRestart={handlePlayAgain}
        headerActions={
          phase === 'lobby' ? (
            <Button variant="ghost" size="md" onClick={() => setRulesOpen(true)}>
              {t.rulesTitle}
            </Button>
          ) : null
        }
      >
        {phase === 'lobby' ? (
          <SettingsPanel title={t.lobbyTitle} onStart={handleStart} startLabel={t.start}>
            <TeamsSetup
              value={teamsSetup}
              min={TEMPLATE_MANIFEST.teams.min}
              max={TEMPLATE_MANIFEST.teams.max}
              onChange={setTeamsSetup}
            />
          </SettingsPanel>
        ) : (
          <div className="flex flex-col gap-6 p-4 md:p-6">
            <ScoreBoard
              teams={scoreTeams}
              activeTeamId={String(activeTeamIndex)}
              modeLabel={t.modeLabel}
              onFinish={phase === 'playing' ? handleFinish : undefined}
              finishLabel={t.endRound}
            />
            {phase === 'playing' ? (
              <div className="flex flex-wrap gap-3">
                {scoreTeams.map((team, index) => (
                  <Button
                    key={team.id}
                    variant={index === activeTeamIndex ? 'primary' : 'secondary'}
                    onClick={() => setActiveTeamIndex(index)}
                  >
                    {team.name}
                  </Button>
                ))}
                <Button onClick={handleScore}>{t.scoreTurn}</Button>
              </div>
            ) : null}
          </div>
        )}
      </GameShell>

      <RulesDialog
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title={t.rulesTitle}
        content={t.rules}
      />

      {phase === 'finished' ? (
        <VictoryScreen
          ranking={scoreTeams}
          onPlayAgain={handlePlayAgain}
          onExit={handlePlayAgain}
        />
      ) : null}
    </>
  );
}
