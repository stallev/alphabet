import { describe, expect, it } from "vitest";

import {
  addTeamScore,
  createInitialScores,
  POINTS_PER_TURN,
} from "@/games/_template/logic/scoring";

describe("createInitialScores", () => {
  it("returns zeros for each team", () => {
    expect(createInitialScores(3)).toEqual([0, 0, 0]);
  });
});

describe("addTeamScore", () => {
  it("increments the selected team", () => {
    expect(addTeamScore([0, 5, 2], 1)).toEqual([0, 5 + POINTS_PER_TURN, 2]);
  });

  it("ignores invalid team index", () => {
    expect(addTeamScore([1, 2], 5)).toEqual([1, 2]);
  });
});
