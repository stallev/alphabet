import type { Question } from '@/games/alphabet/types';
import type { QuizQuestion } from '@/shared/game-kit/types';

export function mapQuestion(question: Question): QuizQuestion {
  if (question.answerType === 'ID') {
    return {
      id: question.id,
      text: question.questionContent,
      answer: {
        kind: 'choice',
        options: (question.answersList ?? []).map((answer) => ({
          id: answer.id,
          label: answer.value,
        })),
        correctId: question.rightAnswerId ?? -1,
      },
    };
  }

  return {
    id: question.id,
    text: question.questionContent,
    answer: {
      kind: 'text',
      correctText: question.rightAnswerString ?? '',
    },
  };
}
