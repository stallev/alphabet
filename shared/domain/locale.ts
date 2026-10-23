export type Locale = "ru" | "en" | "uk" | "de" | "ro";

export const ACTIVE_LOCALES = ["ru", "en"] as const satisfies readonly Locale[];

export const DEFAULT_LOCALE: Locale = "ru";
