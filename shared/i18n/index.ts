export {
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
  type ActiveLocale,
  type Locale,
} from '@/shared/domain/locale';

export { LOCALE_COOKIE } from './constants';
export { format } from './format';
export { GameI18nProvider, useGameT } from './GameI18nProvider';
export { I18nProvider, useLocale, useT } from './I18nProvider';
export { LocaleSwitcher } from './LocaleSwitcher';
export { plural, type PluralForms } from './plural';
export { resolveLocale } from './resolve-locale';
export { getDictionary, getLocale } from './server';
export { setLocale } from './actions/set-locale';
export type { DeepStringRecord, Dictionary } from './types';
