import { describe, expect, it } from "vitest";

import { getGameEntry } from "@/games/registry";
import nextConfig from "@/next.config";

import { dynamicParams, generateStaticParams } from "./page";

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
