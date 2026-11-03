import type { GameManifest } from "@/shared/game-kit/manifest";

export const TEMPLATE_MANIFEST: GameManifest = {
  slug: "template",
  title: { ru: "Шаблон", en: "Template" },
  tagline: {
    ru: "Пример игры со счётом команд",
    en: "Sample team score counter game",
  },
  description: {
    ru: "Заготовка новой игры Circle: лобби, раунд с табло и экран победы на game-kit.",
    en: "Starter for a new Circle game: lobby, scoreboard round, and victory screen on game-kit.",
  },
  status: "coming-soon",
  tags: ["team", "party"],
  teams: { min: 2, max: 4 },
  tile: { glyph: "T", tone: 3 },
  order: 90,
};
