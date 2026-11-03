'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { ACTIVE_LOCALES } from '@/shared/domain/locale';

import { LOCALE_COOKIE } from '../constants';

type ActiveLocale = (typeof ACTIVE_LOCALES)[number];

function isActiveLocale(value: string): value is ActiveLocale {
  return (ACTIVE_LOCALES as readonly string[]).includes(value);
}

export async function setLocale(locale: string): Promise<void> {
  if (!isActiveLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}
