import { ComplexityLevel } from "@/games/alphabet/types";
import {
  SCORE_EASY,
  SCORE_HARD,
  SCORE_MATCH,
  SCORE_MEDIUM,
} from "@/games/alphabet/constants";

export function pointsForMatch(): number {
  return SCORE_MATCH;
}

export function pointsForAnswer(
  level: ComplexityLevel,
  correct: boolean,
): number {
  if (!correct) return 0;
  if (level === ComplexityLevel.EASY) return SCORE_EASY;
  if (level === ComplexityLevel.MEDIUM) return SCORE_MEDIUM;
  return SCORE_HARD;
}
