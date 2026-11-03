import { describe, expect, it } from 'vitest';

import { ComplexityLevel, type Question } from '@/games/alphabet/types';
import { mapQuestion } from '@/games/alphabet/logic/map-question';

const baseQuestion: Question = {
  id: 1,
  questionContent: 'Sample?',
  complexityLevel: ComplexityLevel.EASY,
  answersList: null,
  answerType: 'String',
};

describe('mapQuestion', () => {
  it('maps ID answers to choice', () => {
    const question: Question = {
      ...baseQuestion,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'A' },
        { id: 2, value: 'B' },
      ],
      rightAnswerId: 2,
    };

    expect(mapQuestion(question)).toEqual({
      id: 1,
      text: 'Sample?',
      answer: {
        kind: 'choice',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        correctId: 2,
      },
    });
  });

  it('maps String answers to text', () => {
    const question: Question = {
      ...baseQuestion,
      answerType: 'String',
      rightAnswerString: 'Answer',
    };

    expect(mapQuestion(question)).toEqual({
      id: 1,
      text: 'Sample?',
      answer: {
        kind: 'text',
        correctText: 'Answer',
      },
    });
  });

  it('handles missing answersList and rightAnswerId for choice', () => {
    const question: Question = {
      ...baseQuestion,
      answerType: 'ID',
      answersList: null,
      rightAnswerId: undefined,
    };

    expect(mapQuestion(question).answer).toEqual({
      kind: 'choice',
      options: [],
      correctId: -1,
    });
  });

  it('handles missing rightAnswerString for text', () => {
    const question: Question = {
      ...baseQuestion,
      answerType: 'String',
      rightAnswerString: undefined,
    };

    expect(mapQuestion(question).answer).toEqual({
      kind: 'text',
      correctText: '',
    });
  });
});
