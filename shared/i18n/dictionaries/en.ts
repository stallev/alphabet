import type { Dictionary } from '@/shared/i18n/types';

export const en: Dictionary = {
  site: {
    name: 'EdenGames',
    tagline: 'Team games for youth ministries',
    description:
      'Interactive Christian team games in the browser: quizzes, memory, and party modes.',
  },
  nav: {
    home: 'Home',
    catalog: 'Catalog',
    skipToGame: 'Skip to game',
  },
  catalog: {
    title: 'Games',
    play: 'Play',
    comingSoon: 'Coming soon',
    empty: 'No games available yet.',
    teams: {
      one: '{min}–{max} team',
      few: '{min}–{max} teams',
      many: '{min}–{max} teams',
      other: '{min}–{max} teams',
    },
    minutes: '{count} min',
    age: '{minAge}+',
    tags: {
      memory: 'Memory',
      quiz: 'Quiz',
      team: 'Team',
      party: 'Party',
      solo: 'Solo',
      kids: 'Kids',
      youth: 'Youth',
    },
  },
  gameKit: {
    start: 'Start',
    restart: 'Start over',
    exit: 'Exit',
    stay: 'Stay',
    pause: 'Pause',
    playAgain: 'Play again',
    close: 'Close',
    rules: 'Rules',
    catalogLink: 'Catalog',
    retry: 'Retry',
    confirmExit: {
      title: 'Leave the game?',
      body: 'Progress in this session will be lost.',
    },
    confirmRestart: {
      title: 'Start over?',
      body: 'The current session will be reset.',
    },
    error: {
      title: 'Something went wrong',
      body: 'Could not load the game. Try again or return to the catalog.',
      toCatalog: 'Back to catalog',
    },
    phase: {
      paused: 'Paused',
      finished: 'Game over',
    },
    quiz: {
      submit: 'Submit',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      timedOut: "Time's up",
      showAnswer: 'Correct answer',
    },
    victory: {
      title: 'Victory!',
      tieTitle: 'Tie!',
      winner: 'Winner: {name}',
    },
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    notFound: 'Page not found',
  },
};
