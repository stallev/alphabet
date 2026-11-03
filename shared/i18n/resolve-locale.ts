import {
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
  type Locale,
} from '@/shared/domain/locale';

type ActiveLocale = (typeof ACTIVE_LOCALES)[number];

function isActiveLocale(value: string | undefined): value is ActiveLocale {
  return (
    value !== undefined &&
    (ACTIVE_LOCALES as readonly string[]).includes(value)
  );
}

function localeFromAcceptLanguage(acceptLanguage: string): ActiveLocale {
  const trimmed = acceptLanguage.trim();
  if (!trimmed) {
    return DEFAULT_LOCALE as ActiveLocale;
  }

  const tags = trimmed
    .split(',')
    .map((part) => part.trim().split(';')[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const tag of tags) {
    if (tag.startsWith('ru')) {
      return 'ru';
    }
  }

  return 'en';
}

export function resolveLocale(
  cookieValue: string | undefined,
  acceptLanguage: string,
): Locale {
  if (isActiveLocale(cookieValue)) {
    return cookieValue;
  }

  return localeFromAcceptLanguage(acceptLanguage);
}
