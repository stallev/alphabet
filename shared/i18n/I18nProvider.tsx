'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import type { ActiveLocale } from '@/shared/domain/locale';

import type { Dictionary } from './types';

type I18nContextValue = {
  locale: ActiveLocale;
  dictionary: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: ActiveLocale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale(): ActiveLocale {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useLocale must be used within I18nProvider');
  }
  return value.locale;
}

export function useT(): Dictionary {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useT must be used within I18nProvider');
  }
  return value.dictionary;
}
