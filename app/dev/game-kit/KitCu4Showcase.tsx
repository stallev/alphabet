'use client';

import { useState } from 'react';

import {
  LevelSelect,
  QuestionModal,
  SettingsPanel,
  StepperInput,
  TeamsSetup,
  type LevelOption,
  type QuizQuestion,
} from '@/shared/game-kit';
import { useT } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

const CHOICE_QUESTION: QuizQuestion = {
  id: 'choice-1',
  text: 'Who wrote the Gospel of John?',
  answer: {
    kind: 'choice',
    options: [
      { id: 1, label: 'John the Apostle' },
      { id: 2, label: 'Luke' },
      { id: 3, label: 'Paul' },
    ],
    correctId: 1,
  },
};

const TEXT_QUESTION: QuizQuestion = {
  id: 'text-1',
  text: 'Name the first book of the Bible.',
  answer: { kind: 'text', correctText: 'Genesis' },
};

const DEMO_LEVELS: LevelOption[] = [
  { id: 'easy', label: 'Light', points: 3, remaining: 12 },
  { id: 'medium', label: 'Medium', points: 6, remaining: 8 },
  { id: 'hard', label: 'Deep', points: 10, remaining: 0, disabled: true },
];

const EMPTY_LEVELS: LevelOption[] = [
  { id: 'easy', label: 'Light', points: 3, remaining: 0, disabled: true },
  { id: 'medium', label: 'Medium', points: 6, remaining: 0, disabled: true },
  { id: 'hard', label: 'Deep', points: 10, remaining: 0, disabled: true },
];

export function KitCu4Showcase() {
  const t = useT();
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [emptyLevelOpen, setEmptyLevelOpen] = useState(false);
  const [stepperValue, setStepperValue] = useState(10);
  const [teams, setTeams] = useState({
    count: 2,
    names: ['North', 'South'],
  });
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [lastLevel, setLastLevel] = useState<string | null>(null);

  return (
    <>
      <Card className="flex flex-col gap-4">
        <p className="font-semibold text-fg">QuestionModal</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setChoiceOpen(true)}>Choice question</Button>
          <Button variant="secondary" onClick={() => setTextOpen(true)}>
            Text question
          </Button>
        </div>
        {lastAnswer ? <p className="text-sm text-fg-muted">Last answer: {lastAnswer}</p> : null}
        <QuestionModal
          open={choiceOpen}
          question={CHOICE_QUESTION}
          levelLabel="Light (+3)"
          timerSeconds={8}
          onAnswer={(result) => {
            setLastAnswer(JSON.stringify(result));
            setChoiceOpen(false);
          }}
          onClose={() => setChoiceOpen(false)}
        />
        <QuestionModal
          open={textOpen}
          question={TEXT_QUESTION}
          levelLabel="Medium (+6)"
          timerSeconds={6}
          onAnswer={(result) => {
            setLastAnswer(JSON.stringify(result));
            setTextOpen(false);
          }}
          onClose={() => setTextOpen(false)}
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold text-fg">LevelSelect</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setLevelOpen(true)}>With levels</Button>
          <Button variant="secondary" onClick={() => setEmptyLevelOpen(true)}>
            Empty notice
          </Button>
        </div>
        {lastLevel ? <p className="text-sm text-fg-muted">Selected: {lastLevel}</p> : null}
        <LevelSelect
          open={levelOpen}
          levels={DEMO_LEVELS}
          timerSeconds={5}
          onSelect={(id) => {
            setLastLevel(id);
            setLevelOpen(false);
          }}
          onTimeout={() => {
            setLastLevel('easy (timeout)');
            setLevelOpen(false);
          }}
          onClose={() => setLevelOpen(false)}
        />
        <LevelSelect
          open={emptyLevelOpen}
          levels={EMPTY_LEVELS}
          emptyNotice="All questions in this suite are finished."
          onSelect={() => undefined}
          onClose={() => setEmptyLevelOpen(false)}
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="font-semibold text-fg">StepperInput</p>
        <StepperInput
          label="Flip timer (sec)"
          value={stepperValue}
          min={5}
          max={60}
          step={5}
          onChange={setStepperValue}
        />
      </Card>

      <SettingsPanel title="Lobby layout" startLabel={t.gameKit.start} onStart={() => undefined}>
        <TeamsSetup value={teams} min={2} max={5} onChange={setTeams} />
      </SettingsPanel>
    </>
  );
}
