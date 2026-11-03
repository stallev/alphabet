import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/i18n/server", () => ({
  getLocale: vi.fn(async () => "ru" as const),
}));

const loadPageMock = vi.fn(async () => ({
  default: async () => null,
}));

vi.mock("@/games/registry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/games/registry")>();
  return {
    ...actual,
    getGameEntry: vi.fn(actual.getGameEntry),
  };
});

import { getGameEntry } from "@/games/registry";
import { defineGame } from "@/shared/game-kit/manifest";
import nextConfig from "@/next.config";

import GamePage, { dynamicParams, generateStaticParams } from "./page";

describe("app/[game]/page route segment config", () => {
  it("rejects slugs outside generateStaticParams (static 404)", () => {
    expect(dynamicParams).toBe(false);
  });
});

describe("app/[game]/page generateStaticParams", () => {
  it("returns registry slugs including alphabet", () => {
    expect(generateStaticParams()).toEqual([{ game: "alphabet" }]);
  });

  it("alphabet is active and has loadPage", () => {
    const entry = getGameEntry("alphabet");
    expect(entry?.manifest.status).toBe("active");
    expect(entry?.loadPage).toBeTypeOf("function");
  });

  it("rejects unknown or wrong-case slugs via registry lookup", () => {
    expect(getGameEntry("nonexistent")).toBeUndefined();
    expect(getGameEntry("Alphabet")).toBeUndefined();
  });
});

describe("GamePage loadPage behavior", () => {
  it("does not call loadPage for coming-soon games", async () => {
    loadPageMock.mockClear();
    vi.mocked(getGameEntry).mockReturnValue(
      defineGame({
        manifest: {
          slug: "preview-game",
          title: { ru: "Превью", en: "Preview" },
          tagline: { ru: "Скоро", en: "Soon" },
          description: { ru: "Описание", en: "Description" },
          status: "coming-soon",
          tags: ["party"],
          teams: { min: 2, max: 4 },
          tile: { glyph: "P", tone: 3 },
          order: 99,
        },
      }),
    );

    await GamePage({ params: Promise.resolve({ game: "preview-game" }) });
    expect(loadPageMock).not.toHaveBeenCalled();
  });

  it("calls loadPage for active games", async () => {
    loadPageMock.mockClear();
    vi.mocked(getGameEntry).mockReturnValue(
      defineGame({
        manifest: {
          slug: "live-game",
          title: { ru: "Живая", en: "Live" },
          tagline: { ru: "Игра", en: "Play" },
          description: { ru: "Описание", en: "Description" },
          status: "active",
          tags: ["team"],
          teams: { min: 2, max: 4 },
          tile: { glyph: "L", tone: 2 },
          order: 1,
        },
        loadPage: loadPageMock,
      }),
    );

    await GamePage({ params: Promise.resolve({ game: "live-game" }) });
    expect(loadPageMock).toHaveBeenCalledTimes(1);
  });
});

describe("next.config redirects", () => {
  it("permanently redirects /game to /alphabet", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/game",
          destination: "/alphabet",
          permanent: true,
        }),
      ]),
    );
  });
});
