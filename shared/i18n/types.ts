import type { ru } from '@/shared/i18n/dictionaries/ru';

export type DeepStringRecord<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DeepStringRecord<U>[]
    : T extends object
      ? { [K in keyof T]: DeepStringRecord<T[K]> }
      : never;

export type Dictionary = DeepStringRecord<typeof ru>;
