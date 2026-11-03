export const POINTS_PER_TURN = 1;

export function addTeamScore(scores: readonly number[], teamIndex: number): number[] {
  if (teamIndex < 0 || teamIndex >= scores.length) {
    return [...scores];
  }
  return scores.map((score, index) =>
    index === teamIndex ? score + POINTS_PER_TURN : score,
  );
}

export function createInitialScores(teamCount: number): number[] {
  return Array.from({ length: teamCount }, () => 0);
}
