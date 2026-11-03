export const ru = {
  site: {
    name: 'EdenGames',
    tagline: 'Командные игры для молодёжных служений',
    description:
      'Интерактивные христианские игры для команд: викторины, память и вечеринки в браузере.',
  },
  nav: {
    home: 'На главную',
    catalog: 'Каталог',
    skipToGame: 'Пропустить к игре',
  },
  catalog: {
    title: 'Игры',
    play: 'Играть',
    comingSoon: 'Скоро',
    empty: 'Пока нет доступных игр.',
    teams: {
      one: '{min}–{max} команда',
      few: '{min}–{max} команды',
      many: '{min}–{max} команд',
      other: '{min}–{max} команд',
    },
    minutes: '{count} мин',
    age: '{minAge}+',
    tags: {
      memory: 'Память',
      quiz: 'Викторина',
      team: 'Команда',
      party: 'Вечеринка',
      solo: 'Соло',
      kids: 'Дети',
      youth: 'Молодёжь',
    },
  },
  gameKit: {
    start: 'Начать',
    restart: 'Начать заново',
    exit: 'Выйти',
    stay: 'Остаться',
    pause: 'Пауза',
    playAgain: 'Играть снова',
    close: 'Закрыть',
    rules: 'Правила',
    catalogLink: 'Каталог',
    retry: 'Повторить',
    confirmExit: {
      title: 'Выйти из игры?',
      body: 'Прогресс текущей партии будет потерян.',
    },
    confirmRestart: {
      title: 'Начать заново?',
      body: 'Текущая партия будет сброшена.',
    },
    error: {
      title: 'Что-то пошло не так',
      body: 'Не удалось загрузить игру. Попробуйте ещё раз или вернитесь в каталог.',
      toCatalog: 'В каталог',
    },
    phase: {
      paused: 'Пауза',
      finished: 'Игра окончена',
    },
    quiz: {
      submit: 'Ответить',
      correct: 'Верно!',
      incorrect: 'Неверно',
      timedOut: 'Время вышло',
      showAnswer: 'Правильный ответ',
    },
    victory: {
      title: 'Победа!',
      tieTitle: 'Ничья!',
      winner: 'Победитель: {name}',
    },
  },
  errors: {
    generic: 'Произошла ошибка. Попробуйте ещё раз.',
    notFound: 'Страница не найдена',
  },
} as const;
