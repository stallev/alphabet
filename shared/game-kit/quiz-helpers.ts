import type { QuizAnswer, QuizQuestion } from './types';

export function getCorrectAnswerLabel(question: QuizQuestion): string {
  const { answer } = question;
  if (answer.kind === 'text') {
    return answer.correctText;
  }
  return (
    answer.options.find((option) => option.id === answer.correctId)?.label ?? ''
  );
}

export function isChoiceCorrect(answer: QuizAnswer, selectedId: number): boolean {
  return answer.kind === 'choice' && selectedId === answer.correctId;
}
