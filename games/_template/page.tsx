import type { GamePageProps } from '@/shared/game-kit/manifest';

import { TemplateGameClient } from '@/games/_template/TemplateGameClient';
import { en } from '@/games/_template/i18n/en';
import { ru } from '@/games/_template/i18n/ru';

export default function TemplateGamePage({ locale }: GamePageProps) {
  const dictionary = locale === 'en' ? en : ru;
  return <TemplateGameClient dictionary={dictionary} />;
}
