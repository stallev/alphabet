import { describe, expect, it } from "vitest";

import { ComplexityLevel } from "@/games/alphabet/types";
import {
  SCORE_EASY,
  SCORE_HARD,
  SCORE_MATCH,
  SCORE_MEDIUM,
} from "@/games/alphabet/constants";
import { pointsForAnswer, pointsForMatch } from "@/games/alphabet/logic/scoring";

describe("pointsForMatch", () => {
  it("returns SCORE_MATCH", () => {
    expect(pointsForMatch()).toBe(SCORE_MATCH);
  });
});

describe("pointsForAnswer", () => {
  it("returns 0 for incorrect answers", () => {
    expect(pointsForAnswer(ComplexityLevel.EASY, false)).toBe(0);
    expect(pointsForAnswer(ComplexityLevel.MEDIUM, false)).toBe(0);
    expect(pointsForAnswer(ComplexityLevel.HARD, false)).toBe(0);
  });

  it("returns level scores for correct answers", () => {
    expect(pointsForAnswer(ComplexityLevel.EASY, true)).toBe(SCORE_EASY);
    expect(pointsForAnswer(ComplexityLevel.MEDIUM, true)).toBe(SCORE_MEDIUM);
    expect(pointsForAnswer(ComplexityLevel.HARD, true)).toBe(SCORE_HARD);
  });
});
