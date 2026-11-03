import { describe, expect, it } from 'vitest';

import { plural } from './plural';

const ruTeams = {
  one: '{n} команда',
  few: '{n} команды',
  many: '{n} команд',
  other: '{n} команд',
};

describe('plural', () => {
  it('selects Russian forms', () => {
    expect(plural('ru', ruTeams, 1)).toBe('{n} команда');
    expect(plural('ru', ruTeams, 2)).toBe('{n} команды');
    expect(plural('ru', ruTeams, 5)).toBe('{n} команд');
    expect(plural('ru', ruTeams, 11)).toBe('{n} команд');
    expect(plural('ru', ruTeams, 21)).toBe('{n} команда');
    expect(plural('ru', ruTeams, 22)).toBe('{n} команды');
    expect(plural('ru', ruTeams, 25)).toBe('{n} команд');
  });

  it('selects English one/other', () => {
    const enTeams = { one: '{n} team', other: '{n} teams' };
    expect(plural('en', enTeams, 1)).toBe('{n} team');
    expect(plural('en', enTeams, 2)).toBe('{n} teams');
    expect(plural('en', enTeams, 5)).toBe('{n} teams');
  });
});
