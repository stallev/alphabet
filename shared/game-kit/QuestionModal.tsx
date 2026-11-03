'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { useT } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';

import { checkTextAnswer } from './check-text-answer';
import { Confetti } from './Confetti';
import { getCorrectAnswerLabel, isChoiceCorrect } from './quiz-helpers';
import { Timer } from './Timer';
import type { AnswerResult, QuizQuestion } from './types';

export interface QuestionModalProps {
  open: boolean;
  question: QuizQuestion;
  levelLabel: string;
  timerSeconds?: number;
  resultDelayMs?: number;
  timeoutDelayMs?: number;
  onAnswer: (result: AnswerResult) => void;
  onClose?: () => void;
}

type ResultPhase = 'idle' | 'correct' | 'wrong';

export function QuestionModal({
  open,
  question,
  levelLabel,
  timerSeconds = 30,
  resultDelayMs = 2500,
  timeoutDelayMs = 2000,
  onAnswer,
  onClose,
}: QuestionModalProps) {
  const t = useT();
  const [inputValue, setInputValue] = useState('');
  const [resultPhase, setResultPhase] = useState<ResultPhase>('idle');
  const [timerRunning, setTimerRunning] = useState(true);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setInputValue('');
      setResultPhase('idle');
      setTimerRunning(true);
      submittedRef.current = false;
    }
  }, [open, question.id]);

  const finish = (correct: boolean, timedOut: boolean, delayMs: number) => {
    if (submittedRef.current) {
      return;
    }
    submittedRef.current = true;
    setTimerRunning(false);
    setResultPhase(correct ? 'correct' : 'wrong');
    window.setTimeout(() => {
      onAnswer({ correct, timedOut });
      setResultPhase('idle');
      setInputValue('');
      submittedRef.current = false;
    }, delayMs);
  };

  const handleChoice = (optionId: number) => {
    if (resultPhase !== 'idle' || submittedRef.current) {
      return;
    }
    finish(isChoiceCorrect(question.answer, optionId), false, resultDelayMs);
  };

  const handleTextSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (resultPhase !== 'idle' || submittedRef.current || !inputValue.trim()) {
      return;
    }
    const correct =
      question.answer.kind === 'text' &&
      checkTextAnswer(inputValue, question.answer.correctText);
    finish(correct, false, resultDelayMs);
  };

  const handleTimeout = () => {
    if (resultPhase !== 'idle' || submittedRef.current) {
      return;
    }
    finish(false, true, timeoutDelayMs);
  };

  const correctLabel = getCorrectAnswerLabel(question);

  return (
    <Dialog
      open={open}
      onClose={onClose ?? (() => undefined)}
      title={`${t.gameKit.quiz.questionTitle} · ${levelLabel}`}
      className="max-w-3xl"
      closeOnBackdrop={false}
    >
      {resultPhase === 'correct' ? <Confetti /> : null}
      {resultPhase !== 'idle' ? (
        <div className="py-10 text-center">
          <p
            className={`text-4xl font-extrabold ${resultPhase === 'correct' ? 'text-success' : 'text-danger'}`}
          >
            {resultPhase === 'correct' ? t.gameKit.quiz.correct : t.gameKit.quiz.incorrect}
          </p>
          {resultPhase === 'wrong' ? (
            <p className="mt-4 text-lg text-fg-muted">
              {t.gameKit.quiz.showAnswer}:{' '}
              <span className="font-bold text-fg">{correctLabel}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <p className="mb-6 text-xl font-bold leading-snug text-fg">{question.text}</p>
          {question.answer.kind === 'choice' ? (
            <div className="mb-6 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label={question.text}>
              {question.answer.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={false}
                  onClick={() => handleChoice(option.id)}
                  className="min-h-12 rounded-ctl bg-primary px-4 py-4 text-left text-base font-semibold text-primary-fg shadow-card hover:brightness-95 active:scale-[0.99]"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="mb-6 flex flex-col gap-3">
              <Input
                label={t.gameKit.quiz.answerLabel}
                value={inputValue}
                autoFocus
                onChange={(event) => setInputValue(event.target.value)}
              />
              <Button type="submit" size="lg">
                {t.gameKit.quiz.submit}
              </Button>
            </form>
          )}
          <Timer
            seconds={timerSeconds}
            running={open && timerRunning}
            onElapsed={handleTimeout}
            variant="bar"
            label={t.gameKit.quiz.timedOut}
          />
        </>
      )}
    </Dialog>
  );
}
