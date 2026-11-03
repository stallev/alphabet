import type { TemplateDictionary } from './ru';

export const en: TemplateDictionary = {
  lobbyTitle: 'Game setup',
  start: 'Start game',
  scoreTurn: '+1 point to team',
  endRound: 'Finish round',
  modeLabel: 'Score counter',
  rulesTitle: 'Rules',
  rules: [
    {
      heading: 'Goal',
      body: 'Score more points than other teams by tapping “+1 point” for the active team.',
    },
    {
      heading: 'Turn',
      body: 'After start, pick the active team on the scoreboard and add points. Finish when done.',
    },
  ],
};
