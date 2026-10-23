import { describe, expect, it } from "vitest";

import { defineGame, GAME_TAGS } from "./manifest";

describe("defineGame", () => {
  it("returns the same entry for typing", () => {
    const entry = defineGame({
      manifest: {
        slug: "sample",
        title: { ru: "Т", en: "T" },
        tagline: { ru: "С", en: "S" },
        description: { ru: "О", en: "D" },
        status: "coming-soon",
        tags: [GAME_TAGS[0]],
        teams: { min: 1, max: 4 },
        cover: "",
        order: 0,
      },
    });
    expect(entry.manifest.slug).toBe("sample");
  });
});
