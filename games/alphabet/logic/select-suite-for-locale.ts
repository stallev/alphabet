import type { Locale } from '@/shared/domain/locale';

import type { QuestionsSuite } from '@/games/alphabet/types';

export function selectSuiteForLocale(
  suites: QuestionsSuite[],
  locale: Locale,
): { suite: QuestionsSuite | null; usedFallback: boolean } {
  const validSuites = suites.filter((suite) => Array.isArray(suite.questionsList));
  const matchingSuite = validSuites.find((suite) => suite.language === locale);
  if (matchingSuite) {
    return { suite: matchingSuite, usedFallback: false };
  }

  const russianSuite = validSuites.find((suite) => suite.language === 'ru');
  if (russianSuite) {
    return { suite: russianSuite, usedFallback: locale !== 'ru' };
  }

  return { suite: validSuites[0] ?? null, usedFallback: false };
}
