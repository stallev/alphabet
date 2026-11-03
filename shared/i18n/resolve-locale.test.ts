import { describe, expect, it } from 'vitest';

import { resolveLocale } from './resolve-locale';

describe('resolveLocale', () => {
  it('uses ru or en cookie when set', () => {
    expect(resolveLocale('ru', '')).toBe('ru');
    expect(resolveLocale('en', '')).toBe('en');
  });

  it('ignores invalid or empty cookie and parses Accept-Language', () => {
    expect(resolveLocale('de', 'en-US,en;q=0.9')).toBe('en');
    expect(resolveLocale('', 'ru-RU,ru;q=0.9')).toBe('ru');
    expect(resolveLocale('garbage', 'de-DE')).toBe('en');
  });

  it('defaults to ru when cookie and Accept-Language are empty', () => {
    expect(resolveLocale(undefined, '')).toBe('ru');
    expect(resolveLocale('', '')).toBe('ru');
  });
});
