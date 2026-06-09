import { ComplexityLevel } from '@/types';
import type { QuestionsSuite } from '@/types';

/**
 * Static demo suites used in AIGenerator Demo Mode.
 * These questions represent real generator output format — shown to users
 * to demonstrate product value without consuming AI API tokens.
 * Full suite (150 questions) is gated behind CreditsGateOverlay.
 */

export const DEMO_SUITE_RU: QuestionsSuite = {
  title: 'Деяния Апостолов',
  language: 'ru',
  questionsList: [
    {
      id: 1,
      questionContent: 'Сколько дней Иисус являлся апостолам после воскресения, прежде чем вознёсся на небо?',
      complexityLevel: ComplexityLevel.EASY,
      answerType: 'ID',
      answersList: [
        { id: 1, value: '3 дня' },
        { id: 2, value: '7 дней' },
        { id: 3, value: '40 дней' },
        { id: 4, value: '50 дней' },
      ],
      rightAnswerId: 3,
    },
    {
      id: 2,
      questionContent: 'Кто был избран вместо Иуды Искариота, чтобы занять место в числе двенадцати апостолов?',
      complexityLevel: ComplexityLevel.EASY,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Стефан' },
        { id: 2, value: 'Матфий' },
        { id: 3, value: 'Варнава' },
        { id: 4, value: 'Тит' },
      ],
      rightAnswerId: 2,
    },
    {
      id: 3,
      questionContent: 'В каком городе верующих впервые стали называть христианами?',
      complexityLevel: ComplexityLevel.MEDIUM,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Иерусалим' },
        { id: 2, value: 'Рим' },
        { id: 3, value: 'Антиохия' },
        { id: 4, value: 'Ефес' },
      ],
      rightAnswerId: 3,
    },
    {
      id: 4,
      questionContent: 'Кто из апостолов был первым мучеником, убитым по приказу царя Ирода Агриппы I?',
      complexityLevel: ComplexityLevel.MEDIUM,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Пётр' },
        { id: 2, value: 'Иоанн' },
        { id: 3, value: 'Иаков, сын Зеведея' },
        { id: 4, value: 'Андрей' },
      ],
      rightAnswerId: 3,
    },
    {
      id: 5,
      questionContent: 'Какое имя носил Павел до своего призыва и обращения на пути в Дамаск?',
      complexityLevel: ComplexityLevel.HARD,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Симон' },
        { id: 2, value: 'Савл' },
        { id: 3, value: 'Левий' },
        { id: 4, value: 'Варсава' },
      ],
      rightAnswerId: 2,
    },
    {
      id: 6,
      questionContent: 'Кого именно видел Стефан в момент своего побивания камнями, о чём он возвестил свидетелям?',
      complexityLevel: ComplexityLevel.HARD,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Ангела, держащего меч' },
        { id: 2, value: 'Иисуса, сидящего одесную Бога' },
        { id: 3, value: 'Моисея и Илию' },
        { id: 4, value: 'Пламенный столп' },
      ],
      rightAnswerId: 2,
    },
  ],
};

export const DEMO_SUITE_EN: QuestionsSuite = {
  title: 'Acts of the Apostles',
  language: 'en',
  questionsList: [
    {
      id: 1,
      questionContent: 'For how many days did Jesus appear to the apostles after his resurrection before ascending to heaven?',
      complexityLevel: ComplexityLevel.EASY,
      answerType: 'ID',
      answersList: [
        { id: 1, value: '3 days' },
        { id: 2, value: '7 days' },
        { id: 3, value: '40 days' },
        { id: 4, value: '50 days' },
      ],
      rightAnswerId: 3,
    },
    {
      id: 2,
      questionContent: 'Who was chosen to replace Judas Iscariot and restore the number of apostles to twelve?',
      complexityLevel: ComplexityLevel.EASY,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Stephen' },
        { id: 2, value: 'Matthias' },
        { id: 3, value: 'Barnabas' },
        { id: 4, value: 'Titus' },
      ],
      rightAnswerId: 2,
    },
    {
      id: 3,
      questionContent: 'In which city were the disciples first called Christians?',
      complexityLevel: ComplexityLevel.MEDIUM,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Jerusalem' },
        { id: 2, value: 'Rome' },
        { id: 3, value: 'Antioch' },
        { id: 4, value: 'Ephesus' },
      ],
      rightAnswerId: 3,
    },
    {
      id: 4,
      questionContent: 'Which apostle was the first to be executed by order of King Herod Agrippa I?',
      complexityLevel: ComplexityLevel.MEDIUM,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Peter' },
        { id: 2, value: 'John' },
        { id: 3, value: 'James, son of Zebedee' },
        { id: 4, value: 'Andrew' },
      ],
      rightAnswerId: 3,
    },
    {
      id: 5,
      questionContent: 'What was Paul\'s name before his conversion on the road to Damascus?',
      complexityLevel: ComplexityLevel.HARD,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'Simon' },
        { id: 2, value: 'Saul' },
        { id: 3, value: 'Levi' },
        { id: 4, value: 'Barsabbas' },
      ],
      rightAnswerId: 2,
    },
    {
      id: 6,
      questionContent: 'What did Stephen declare he saw at the moment of his stoning?',
      complexityLevel: ComplexityLevel.HARD,
      answerType: 'ID',
      answersList: [
        { id: 1, value: 'An angel holding a sword' },
        { id: 2, value: 'Jesus standing at the right hand of God' },
        { id: 3, value: 'Moses and Elijah' },
        { id: 4, value: 'A pillar of fire' },
      ],
      rightAnswerId: 2,
    },
  ],
};

export function getDemoSuite(lang: string): QuestionsSuite {
  return lang === 'ru' ? DEMO_SUITE_RU : DEMO_SUITE_EN;
}
