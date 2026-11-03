'use client';

import { useMemo } from 'react';

import { useGameStore } from '@/games/alphabet/store';
import { ComplexityLevel } from '@/games/alphabet/types';
import { mapLevels } from '@/games/alphabet/logic/map-level';
import { useGameT } from '@/games/alphabet/i18n/use-game-t';
import { LevelSelect } from '@/shared/game-kit';

export function LevelSelectContainer() {
  const t = useGameT();
  const { temp, questions, settings, selectComplexity, closeLevelSelect } = useGameStore();

  const levels = useMemo(
    () =>
      mapLevels(
        {
          currentSuite: questions.currentSuite,
          answeredQuestionIds: questions.answeredQuestionIds,
        },
        t.complexity,
      ),
    [questions.answeredQuestionIds, questions.currentSuite, t.complexity],
  );

  const handleTimeout = () => {
    const firstAvailable = levels.find((level) => !level.disabled);
    if (firstAvailable) {
      selectComplexity(firstAvailable.id as ComplexityLevel);
      return;
    }
    closeLevelSelect();
  };

  return (
    <LevelSelect
      open={temp.showLevelSelect}
      levels={levels}
      timerSeconds={settings.levelSelectTimer}
      onSelect={(id) => selectComplexity(id as ComplexityLevel)}
      onTimeout={handleTimeout}
      emptyNotice={t.allQuestionsFinished}
      onClose={closeLevelSelect}
    />
  );
}
