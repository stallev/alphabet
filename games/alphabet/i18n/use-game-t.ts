import { useGameT as useGameTBase } from '@/shared/i18n/GameI18nProvider';

import type { AlphabetDictionary } from './en';

export function useGameT(): AlphabetDictionary {
  return useGameTBase<AlphabetDictionary>();
}
