'use client';

import type { Locale } from '@/shared/domain/locale';
import { GameI18nProvider } from '@/shared/i18n/GameI18nProvider';

import { GameApp } from '@/games/alphabet/components/GameApp';
import type { AlphabetDictionary } from '@/games/alphabet/i18n/en';
import type { QuestionsSuite } from '@/games/alphabet/types';

interface AlphabetGameClientProps {
  locale: Locale;
  dictionary: AlphabetDictionary;
  initialSuites: QuestionsSuite[];
}

export function AlphabetGameClient({
  locale,
  dictionary,
  initialSuites,
}: AlphabetGameClientProps) {
  return (
    <GameI18nProvider value={dictionary}>
      <GameApp locale={locale} initialSuites={initialSuites} />
    </GameI18nProvider>
  );
}
