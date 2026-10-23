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
    cover: "",
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

  it("accepts a valid active entry with loadPage and cover", () => {
    expect(() =>
      assertValidRegistry([
        entry(
          { status: "active", cover: "/games/sample-game/cover.webp" },
          async () => ({ default: async () => null }),
        ),
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
    expect(() =>
      assertValidRegistry([
        entry({ status: "active", cover: "/games/sample-game/cover.webp" }),
      ]),
    ).toThrow('active game "sample-game" has no loadPage');
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

  it("rejects active game without cover", () => {
    expect(() =>
      assertValidRegistry([
        entry({ status: "active", cover: "" }, async () => ({
          default: async () => null,
        })),
      ]),
    ).toThrow('active game "sample-game" has no cover');
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
});

describe("RESERVED_SLUGS", () => {
  it("includes admin from the contract", () => {
    expect(RESERVED_SLUGS).toContain("admin");
  });
});
