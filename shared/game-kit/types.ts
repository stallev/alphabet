import type { ReactNode } from 'react';

export type GamePhase = 'lobby' | 'playing' | 'paused' | 'finished';

export interface ScoreTeam {
  id: string;
  name: string;
  score: number;
  colorIndex: number;
}

export type QuizLevelId = 'easy' | 'medium' | 'hard';

export interface LevelOption {
  id: string;
  label: string;
  points: number;
  remaining?: number;
  disabled?: boolean;
}

export type QuizAnswer =
  | { kind: 'choice'; options: { id: number; label: string }[]; correctId: number }
  | { kind: 'text'; correctText: string };

export interface QuizQuestion {
  id: string | number;
  text: string;
  answer: QuizAnswer;
}

export interface AnswerResult {
  correct: boolean;
  timedOut: boolean;
}

export interface RulesSection {
  heading: string;
  body: ReactNode;
}

export type RulesContent = RulesSection[];

export type RankedTeam = ScoreTeam & { rank: number };
