import { useGameT as useGameTBase } from '@/shared/i18n/GameI18nProvider';

import type { TemplateDictionary } from './ru';

export function useGameT(): TemplateDictionary {
  return useGameTBase<TemplateDictionary>();
}
