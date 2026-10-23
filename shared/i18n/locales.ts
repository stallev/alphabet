import type { Locale } from '@/shared/domain/locale';

export type LocaleMetaEntry = {
  label: string;
  flag: string;
  shortLabel: string;
  active: boolean;
};

export const LOCALE_META: Record<Locale, LocaleMetaEntry> = {
  ru: { label: 'РУССКИЙ',    flag: '🇷🇺', shortLabel: 'RU', active: true },
  en: { label: 'ENGLISH',    flag: '🇬🇧', shortLabel: 'EN', active: true },
  uk: { label: 'УКРАЇНСЬКА', flag: '🇺🇦', shortLabel: 'UK', active: false },
  de: { label: 'DEUTSCH',    flag: '🇩🇪', shortLabel: 'DE', active: false },
  ro: { label: 'ROMÂNĂ',     flag: '🇷🇴', shortLabel: 'RO', active: false },
};

