import 'server-only';

import { cookies, headers } from 'next/headers';

import { ACTIVE_LOCALES } from '@/shared/domain/locale';

import { LOCALE_COOKIE } from './constants';
import { en } from './dictionaries/en';
import { ru } from './dictionaries/ru';
import { resolveLocale } from './resolve-locale';
import type { Dictionary } from './types';

type ActiveLocale = (typeof ACTIVE_LOCALES)[number];

export async function getLocale(): Promise<ActiveLocale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('accept-language') ?? '';

  return resolveLocale(cookieValue, acceptLanguage) as ActiveLocale;
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return locale === 'en' ? en : ru;
}
