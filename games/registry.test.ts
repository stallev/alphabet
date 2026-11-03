import { describe, expect, it } from "vitest";

import type { GameEntry, GameManifest } from "@/shared/game-kit/manifest";
import { defineGame } from "@/shared/game-kit/manifest";

import {
  assertValidRegistry,
  GAME_ENTRIES,
  listGames,
  sortGameManifests,
} from "./registry";
import { RESERVED_SLUGS } from "./reserved-slugs";

function baseManifest(overrides: Partial<GameManifest> = {}): GameManifest {
  return {
    slug: "sample-game",
    title: { ru: "Игра", en: "Game" },
    tagline: { ru: "Слоган", en: "Tagline" },
    description: { ru: "Описание", en: "Description" },
    status: "coming-soon",
    tags: ["memory"],
    teams: { min: 1, max: 4 },
    tile: { glyph: "G", tone: 1 },
    order: 10,
    ...overrides,
  };
}

function entry(overrides: Partial<GameManifest> = {}, loadPage?: GameEntry["loadPage"]): GameEntry {
  return defineGame({
    manifest: baseManifest(overrides),
    loadPage,
  });
}

describe("assertValidRegistry", () => {
  it("accepts a valid coming-soon entry", () => {
    expect(() => assertValidRegistry([entry()])).not.toThrow();
  });

  it("accepts a valid active entry with loadPage and tile", () => {
    expect(() =>
      assertValidRegistry([
        entry({ status: "active" }, async () => ({ default: async () => null })),
      ]),
    ).not.toThrow();
  });

  it("rejects invalid slug format", () => {
    expect(() => assertValidRegistry([entry({ slug: "Bad_Slug" })])).toThrow(
      'invalid slug "Bad_Slug"',
    );
  });

  it("rejects reserved slug", () => {
    expect(() => assertValidRegistry([entry({ slug: "admin" })])).toThrow(
      'reserved slug "admin"',
    );
  });

  it("rejects duplicate slug", () => {
    const a = entry({ slug: "dupe-game" });
    expect(() => assertValidRegistry([a, a])).toThrow('duplicate slug "dupe-game"');
  });

  it("rejects active game without loadPage", () => {
    expect(() => assertValidRegistry([entry({ status: "active" })])).toThrow(
      'active game "sample-game" has no loadPage',
    );
  });

  it("rejects coming-soon with loadPage", () => {
    expect(() =>
      assertValidRegistry([entry({}, async () => ({ default: async () => null }))]),
    ).toThrow('coming-soon game "sample-game" must not have loadPage');
  });

  it("rejects empty localized title", () => {
    expect(() =>
      assertValidRegistry([entry({ title: { ru: "", en: "Game" } })]),
    ).toThrow('manifest "sample-game": title.ru must not be empty');
  });

  it("rejects title exceeding limit", () => {
    expect(() =>
      assertValidRegistry([
        entry({ title: { ru: "а".repeat(41), en: "Game" } }),
      ]),
    ).toThrow('manifest "sample-game": title.ru exceeds 40 characters');
  });

  it("rejects empty tags", () => {
    expect(() => assertValidRegistry([entry({ tags: [] })])).toThrow(
      'manifest "sample-game": tags must include at least one tag',
    );
  });

  it("rejects more than four tags", () => {
    expect(() =>
      assertValidRegistry([
        entry({ tags: ["memory", "quiz", "team", "party", "solo"] }),
      ]),
    ).toThrow('manifest "sample-game": tags must not exceed 4 tags');
  });

  it("rejects unknown tag", () => {
    expect(() =>
      assertValidRegistry([
        entry({ tags: ["not-a-tag"] as unknown as GameManifest["tags"] }),
      ]),
    ).toThrow('manifest "sample-game": tags contains unknown tag "not-a-tag"');
  });

  it("rejects invalid teams", () => {
    expect(() => assertValidRegistry([entry({ teams: { min: 0, max: 2 } })])).toThrow(
      'manifest "sample-game": teams.min must be at least 1',
    );
    expect(() => assertValidRegistry([entry({ teams: { min: 3, max: 2 } })])).toThrow(
      'manifest "sample-game": teams.min must not exceed teams.max',
    );
  });

  it("rejects missing tile", () => {
    expect(() =>
      assertValidRegistry([
        entry({ tile: undefined as unknown as GameManifest["tile"] }),
      ]),
    ).toThrow('manifest "sample-game": tile is required');
  });

  it("rejects empty tile glyph", () => {
    expect(() => assertValidRegistry([entry({ tile: { glyph: "  ", tone: 1 } })])).toThrow(
      'manifest "sample-game": tile.glyph must not be empty',
    );
  });

  it("rejects tile glyph longer than two characters", () => {
    expect(() =>
      assertValidRegistry([entry({ tile: { glyph: "ABC", tone: 1 } })]),
    ).toThrow('manifest "sample-game": tile.glyph must be at most 2 characters');
  });

  it("rejects tile glyph with emoji", () => {
    expect(() =>
      assertValidRegistry([entry({ tile: { glyph: "🎮", tone: 1 } })]),
    ).toThrow('manifest "sample-game": tile.glyph must not contain emoji');
  });

  it("rejects tile tone outside 1–5", () => {
    expect(() =>
      assertValidRegistry([entry({ tile: { glyph: "A", tone: 6 as 1 } })]),
    ).toThrow('manifest "sample-game": tile.tone must be between 1 and 5');
  });
});

describe("sortGameManifests", () => {
  it("sorts by order then slug", () => {
    const sorted = sortGameManifests([
      baseManifest({ slug: "z-game", order: 1 }),
      baseManifest({ slug: "a-game", order: 1 }),
      baseManifest({ slug: "first", order: 0 }),
    ]);
    expect(sorted.map((m) => m.slug)).toEqual(["first", "a-game", "z-game"]);
  });
});

describe("listGames on GAME_ENTRIES", () => {
  it("passes assertValidRegistry on the real registry", () => {
    expect(() => assertValidRegistry(GAME_ENTRIES)).not.toThrow();
    expect(listGames().map((m) => m.slug)).toEqual(["alphabet"]);
  });

  it("does not expose the _template slug", () => {
    expect(listGames().map((m) => m.slug)).not.toContain("template");
  });
});

describe("RESERVED_SLUGS", () => {
  it("includes admin from the contract", () => {
    expect(RESERVED_SLUGS).toContain("admin");
  });

  it("includes dev for the game-kit gallery route", () => {
    expect(RESERVED_SLUGS).toContain("dev");
  });

  it("includes template for the game scaffold folder", () => {
    expect(RESERVED_SLUGS).toContain("template");
  });
});
