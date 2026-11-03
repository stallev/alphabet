'use client';

import { useMemo } from 'react';

import { useGameStore } from '@/games/alphabet/store';
import { mapQuestion } from '@/games/alphabet/logic/map-question';
import { useGameT } from '@/games/alphabet/i18n/use-game-t';
import { QuestionModal } from '@/shared/game-kit';
import type { ComplexityLevel } from '@/games/alphabet/types';

export function QuestionModalContainer() {
  const t = useGameT();
  const { temp, settings, answerQuestion } = useGameStore();

  const question = temp.currentQuestion;
  const mappedQuestion = useMemo(
    () => (question ? mapQuestion(question) : null),
    [question],
  );

  if (!mappedQuestion || !question) {
    return null;
  }

  const levelLabel = t.complexity[question.complexityLevel as ComplexityLevel];

  return (
    <QuestionModal
      open={temp.showQuestionModal}
      question={mappedQuestion}
      levelLabel={levelLabel}
      timerSeconds={settings.answerTimer}
      onAnswer={(result) => {
        answerQuestion(result.correct, question.complexityLevel);
      }}
    />
  );
}
