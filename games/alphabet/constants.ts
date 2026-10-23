import { GameMode } from '@/games/alphabet/types';

import type { Locale } from '@/shared/domain/locale';

export const RUSSIAN_ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");
export const UKRAINIAN_ALPHABET = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ".split("");
export const ENGLISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const ALPHABET_BY_LOCALE: Record<Locale, string[]> = {
  ru: RUSSIAN_ALPHABET,
  uk: UKRAINIAN_ALPHABET,
  en: ENGLISH_ALPHABET,
  de: ENGLISH_ALPHABET,
  ro: ENGLISH_ALPHABET,
};

export const DEFAULT_SETTINGS = {
  teamsCount: 2,
  teamNames: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5"],
  gameMode: GameMode.WITH_QUESTIONS,
  questionsTopic: "Bible Stories",
  levelSelectTimer: 5,
  answerTimer: 25,
  flipTimer: 15,
};

export const COLORS = {
  primary: "#1e3a8a", 
  secondary: "#fbbf24", 
  accent: "#ef4444", 
  success: "#10b981", 
  background: "#f8fafc", 
};

export const SCORE_MATCH = 5;
export const SCORE_EASY = 3;
export const SCORE_MEDIUM = 6;
export const SCORE_HARD = 10;
