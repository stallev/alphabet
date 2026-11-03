import {
  SCORE_EASY,
  SCORE_HARD,
  SCORE_MEDIUM,
} from '@/games/alphabet/constants';
import { ComplexityLevel, type QuestionsSuite } from '@/games/alphabet/types';
import type { LevelOption } from '@/shared/game-kit/types';

export interface MapLevelSettings {
  currentSuite: QuestionsSuite | null;
  answeredQuestionIds: number[];
}

export interface MapLevelStrings {
  easy: string;
  medium: string;
  hard: string;
}

function remainingForLevel(
  settings: MapLevelSettings,
  level: ComplexityLevel,
): number {
  if (!settings.currentSuite) {
    return 0;
  }
  return settings.currentSuite.questionsList.filter(
    (question) =>
      question.complexityLevel === level &&
      !settings.answeredQuestionIds.includes(question.id),
  ).length;
}

export function mapLevels(
  settings: MapLevelSettings,
  strings: MapLevelStrings,
): LevelOption[] {
  const levels: { id: ComplexityLevel; label: string; points: number }[] = [
    { id: ComplexityLevel.EASY, label: strings.easy, points: SCORE_EASY },
    { id: ComplexityLevel.MEDIUM, label: strings.medium, points: SCORE_MEDIUM },
    { id: ComplexityLevel.HARD, label: strings.hard, points: SCORE_HARD },
  ];

  return levels.map((level) => {
    const remaining = remainingForLevel(settings, level.id);
    return {
      id: level.id,
      label: level.label,
      points: level.points,
      remaining,
      disabled: remaining === 0,
    };
  });
}
