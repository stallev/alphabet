import type { Locale } from '@/shared/domain/locale';

export type PluralForms = {
  one?: string;
  few?: string;
  many?: string;
  other: string;
};

export function plural(
  locale: Locale,
  forms: PluralForms,
  count: number,
): string {
  const category = new Intl.PluralRules(locale).select(count);
  const resolved =
    forms[category as keyof PluralForms] ??
    forms.other;
  return resolved;
}
