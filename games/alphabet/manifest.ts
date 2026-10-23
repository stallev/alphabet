import { defineGame } from "@/shared/game-kit/manifest";

export default defineGame({
  manifest: {
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
    cover: "/games/alphabet/cover.webp",
    order: 10,
  },
  loadPage: () => import("./page"),
});
