import type { RankedTeam, ScoreTeam } from './types';

export function rankTeams(teams: ScoreTeam[]): RankedTeam[] {
  if (teams.length === 0) {
    return [];
  }

  const indexed = teams.map((team, index) => ({ team, index }));
  indexed.sort((a, b) => {
    if (b.team.score !== a.team.score) {
      return b.team.score - a.team.score;
    }
    return a.index - b.index;
  });

  let rank = 1;
  return indexed.map(({ team }, position) => {
    if (position > 0 && indexed[position - 1].team.score !== team.score) {
      rank = position + 1;
    }
    return { ...team, rank };
  });
}
