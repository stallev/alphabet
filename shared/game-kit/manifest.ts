import type { ReactNode } from "react";

import type { Locale } from "@/shared/domain/locale";

export type ActiveLocale = "ru" | "en";
export type LocalizedText = Record<ActiveLocale, string>;

export const GAME_TAGS = [
  "memory",
  "quiz",
  "team",
  "party",
  "solo",
  "kids",
  "youth",
] as const;
export type GameTag = (typeof GAME_TAGS)[number];

export type GameStatus = "active" | "coming-soon";

export interface GameManifest {
  slug: string;
  title: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  status: GameStatus;
  tags: readonly GameTag[];
  teams: { min: number; max: number };
  minAge?: number;
  durationMinutes?: { min: number; max: number };
  cover: string;
  order: number;
}

export interface GamePageProps {
  locale: Locale;
}

export type GamePageComponent = (
  props: GamePageProps,
) => ReactNode | Promise<ReactNode>;

export interface GameEntry {
  manifest: GameManifest;
  loadPage?: () => Promise<{ default: GamePageComponent }>;
}

export function defineGame(entry: GameEntry): GameEntry {
  return entry;
}
