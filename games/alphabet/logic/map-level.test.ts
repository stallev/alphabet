import { describe, expect, it } from 'vitest';

import { ComplexityLevel, type QuestionsSuite } from '@/games/alphabet/types';
import {
  SCORE_EASY,
  SCORE_HARD,
  SCORE_MEDIUM,
} from '@/games/alphabet/constants';
import { mapLevels } from '@/games/alphabet/logic/map-level';

const strings = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const suite: QuestionsSuite = {
  title: 'Test',
  questionsList: [
    {
      id: 1,
      questionContent: 'Q1',
      complexityLevel: ComplexityLevel.EASY,
      answersList: [{ id: 1, value: 'A' }],
      answerType: 'ID',
      rightAnswerId: 1,
    },
    {
      id: 2,
      questionContent: 'Q2',
      complexityLevel: ComplexityLevel.HARD,
      answersList: null,
      answerType: 'String',
      rightAnswerString: 'x',
    },
  ],
};

describe('mapLevels', () => {
  it('returns levels with score constants and remaining counts', () => {
    const levels = mapLevels(
      { currentSuite: suite, answeredQuestionIds: [2] },
      strings,
    );

    expect(levels).toEqual([
      {
        id: ComplexityLevel.EASY,
        label: 'Easy',
        points: SCORE_EASY,
        remaining: 1,
        disabled: false,
      },
      {
        id: ComplexityLevel.MEDIUM,
        label: 'Medium',
        points: SCORE_MEDIUM,
        remaining: 0,
        disabled: true,
      },
      {
        id: ComplexityLevel.HARD,
        label: 'Hard',
        points: SCORE_HARD,
        remaining: 0,
        disabled: true,
      },
    ]);
  });

  it('returns all disabled when suite is missing', () => {
    const levels = mapLevels(
      { currentSuite: null, answeredQuestionIds: [] },
      strings,
    );

    expect(levels.every((level) => level.disabled && level.remaining === 0)).toBe(
      true,
    );
  });
});
