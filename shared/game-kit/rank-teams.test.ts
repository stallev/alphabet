import { describe, expect, it } from 'vitest';

import { rankTeams } from './rank-teams';
import type { ScoreTeam } from './types';

const team = (
  id: string,
  score: number,
  colorIndex = 0,
): ScoreTeam => ({
  id,
  name: id,
  score,
  colorIndex,
});

describe('rankTeams', () => {
  it('returns empty for no teams', () => {
    expect(rankTeams([])).toEqual([]);
  });

  it('sorts by score descending with stable tie order', () => {
    const ranked = rankTeams([
      team('b', 5, 1),
      team('a', 10, 0),
      team('c', 5, 2),
    ]);
    expect(ranked.map((entry) => entry.id)).toEqual(['a', 'b', 'c']);
    expect(ranked.map((entry) => entry.rank)).toEqual([1, 2, 2]);
  });

  it('assigns shared rank on tie with skipped place', () => {
    const ranked = rankTeams([team('a', 10), team('b', 10), team('c', 5)]);
    expect(ranked.map((entry) => entry.rank)).toEqual([1, 1, 3]);
  });

  it('ranks tied low scores after leader', () => {
    const ranked = rankTeams([team('a', 0), team('b', 0), team('c', 1)]);
    expect(ranked.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);
    expect(ranked.map((entry) => entry.rank)).toEqual([1, 2, 2]);
  });

  it('handles single team', () => {
    expect(rankTeams([team('solo', 3)])).toEqual([
      { id: 'solo', name: 'solo', score: 3, colorIndex: 0, rank: 1 },
    ]);
  });
});
