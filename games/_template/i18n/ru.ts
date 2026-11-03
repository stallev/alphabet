import type { RulesContent } from '@/shared/game-kit/types';

export const ru = {
  lobbyTitle: 'Настройка партии',
  start: 'Начать игру',
  scoreTurn: '+1 очко команде',
  endRound: 'Завершить раунд',
  modeLabel: 'Счётчик очков',
  rulesTitle: 'Правила',
  rules: [
    {
      heading: 'Цель',
      body: 'Набрать больше очков, чем соперники, нажимая «+1 очко» за активную команду.',
    },
    {
      heading: 'Ход',
      body: 'После старта выберите команду на табло и добавляйте очки. Завершите раунд, когда готовы.',
    },
  ] satisfies RulesContent,
};

export type TemplateDictionary = typeof ru;
