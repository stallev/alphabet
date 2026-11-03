'use client';

import type { TemplateDictionary } from '@/games/_template/i18n/ru';
import { TemplateGame } from '@/games/_template/components/TemplateGame';
import { GameI18nProvider } from '@/shared/i18n/GameI18nProvider';

interface TemplateGameClientProps {
  dictionary: TemplateDictionary;
}

export function TemplateGameClient({ dictionary }: TemplateGameClientProps) {
  return (
    <GameI18nProvider value={dictionary}>
      <TemplateGame />
    </GameI18nProvider>
  );
}
