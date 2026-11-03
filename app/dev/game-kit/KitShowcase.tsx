'use client';

import { useState } from 'react';

import {
  GameShell,
  RulesDialog,
  ScoreBoard,
  Timer,
  VictoryScreen,
  type GameManifest,
  type GamePhase,
  type RulesContent,
  type ScoreTeam,
} from '@/shared/game-kit';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

const DEMO_MANIFEST: GameManifest = {
  slug: 'alphabet',
  title: { ru: 'Алфавит', en: 'Alphabet' },
  tagline: { ru: 'Демо game-kit', en: 'Game kit demo' },
  description: { ru: 'Галерея компонентов', en: 'Component gallery' },
  status: 'active',
  tags: ['memory', 'quiz', 'team'],
  teams: { min: 2, max: 6 },
  tile: { glyph: 'А', tone: 1 },
  order: 10,
};

const DEMO_TEAMS: ScoreTeam[] = [
  { id: '1', name: 'Alpha', score: 12, colorIndex: 0 },
  { id: '2', name: 'Beta', score: 8, colorIndex: 1 },
  { id: '3', name: 'Gamma', score: 8, colorIndex: 2 },
];

const TIE_TEAMS: ScoreTeam[] = [
  { id: '1', name: 'North', score: 10, colorIndex: 0 },
  { id: '2', name: 'South', score: 10, colorIndex: 1 },
];

const SAMPLE_RULES: RulesContent = [
  {
    heading: 'Goal',
    body: 'Match pairs and answer quiz questions to score points.',
  },
  {
    heading: 'Teams',
    body: 'Up to six teams take turns; highest score wins.',
  },
];

function CrashProbe({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error('Gallery crash probe');
  }
  return <p className="p-6 text-fg-muted">Game content area</p>;
}

export function KitShowcase() {
  const [shellPhase, setShellPhase] = useState<GamePhase>('lobby');
  const [shellCrash, setShellCrash] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showTieVictory, setShowTieVictory] = useState(false);

  return (
    <section aria-labelledby="kit-heading" className="flex flex-col gap-4">
      <h2 id="kit-heading" className="text-2xl font-bold text-fg">
        Game kit
      </h2>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold text-fg">GameShell — phases</p>
        <div className="flex flex-wrap gap-2">
          {(['lobby', 'playing', 'paused', 'finished'] as GamePhase[]).map((phase) => (
            <Button
              key={phase}
              variant={shellPhase === phase ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setShellPhase(phase)}
            >
              {phase}
            </Button>
          ))}
          <Button variant="danger" onClick={() => setShellCrash((value) => !value)}>
            {shellCrash ? 'Reset crash' : 'Simulate crash'}
          </Button>
        </div>
        <div className="overflow-hidden rounded-card border border-border">
          <GameShell
            manifest={DEMO_MANIFEST}
            phase={shellPhase}
            rules={SAMPLE_RULES}
            onRestart={() => setShellPhase('lobby')}
          >
            <CrashProbe shouldCrash={shellCrash} />
          </GameShell>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold text-fg">ScoreBoard</p>
        <ScoreBoard teams={DEMO_TEAMS} activeTeamId="1" modeLabel="With questions" />
      </Card>

      <Card className="flex flex-col gap-6">
        <p className="font-semibold text-fg">Timer</p>
        <Button variant="ghost" onClick={() => setTimerRunning((value) => !value)}>
          {timerRunning ? 'Pause timer' : 'Run timer'}
        </Button>
        <Timer
          seconds={12}
          running={timerRunning}
          onElapsed={() => setTimerRunning(false)}
          variant="inline"
          label="Inline"
        />
        <Timer
          seconds={12}
          running={timerRunning}
          onElapsed={() => setTimerRunning(false)}
          variant="ring"
          label="Ring"
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold text-fg">Victory & rules</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowVictory(true)}>Show winner</Button>
          <Button variant="secondary" onClick={() => setShowTieVictory(true)}>
            Show tie
          </Button>
          <Button variant="ghost" onClick={() => setRulesOpen(true)}>
            Open rules
          </Button>
        </div>
        <RulesDialog
          open={rulesOpen}
          onClose={() => setRulesOpen(false)}
          title="Rules"
          content={SAMPLE_RULES}
        />
        {showVictory ? (
          <VictoryScreen
            ranking={DEMO_TEAMS}
            onPlayAgain={() => setShowVictory(false)}
            onExit={() => setShowVictory(false)}
          />
        ) : null}
        {showTieVictory ? (
          <VictoryScreen
            ranking={TIE_TEAMS}
            onPlayAgain={() => setShowTieVictory(false)}
          />
        ) : null}
      </Card>
    </section>
  );
}
