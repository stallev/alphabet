import type { GameManifest } from "@/shared/game-kit/manifest";

export const ALPHABET_MANIFEST: GameManifest = {
  slug: "alphabet",
  title: { ru: "Алфавит", en: "Alphabet" },
  tagline: {
    ru: "Найди пары букв и ответь на библейский вопрос",
    en: "Match letter pairs and answer a Bible question",
  },
  description: {
    ru: "«Алфавит» — интерактивная браузерная игра для командных соревнований и викторин. Сочетает механику Memory с буквами алфавита и интеллектуальный квиз.",
    en: "Alphabet is an interactive browser game for team competitions and quizzes. It combines Memory letter matching with an integrated Bible quiz.",
  },
  status: "active",
  tags: ["memory", "quiz", "team", "youth"],
  teams: { min: 2, max: 6 },
  tile: { glyph: "А", tone: 1 },
  order: 10,
};
