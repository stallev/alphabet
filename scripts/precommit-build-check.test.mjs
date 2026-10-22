import { describe, expect, it } from "vitest";
import { STEPS, selectRelevant } from "./precommit-build-check.mjs";

describe("selectRelevant", () => {
  it("selects code, build config and lock files", () => {
    const staged = [
      "app/page.tsx",
      "games/alphabet/logic/scoring.ts",
      "shared/styles/tokens.css",
      "server/db/client.ts",
      "prisma/schema.prisma",
      "public/games/alphabet/cover.webp",
      "proxy.ts",
      "next.config.ts",
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "eslint.config.mjs",
    ];
    expect(selectRelevant(staged)).toEqual(staged);
  });

  it("skips docs, rules, scripts and workflows", () => {
    expect(
      selectRelevant([
        "docs/implementation/phases/R02_tasks.md",
        ".cursor/rules/model-routing.mdc",
        "scripts/cu-commit.mjs",
        ".github/workflows/ci.yml",
        "README.md",
        "AGENTS.md",
      ]),
    ).toEqual([]);
  });

  it("normalizes Windows separators", () => {
    expect(selectRelevant(["games\\alphabet\\store.ts"])).toEqual(["games\\alphabet\\store.ts"]);
  });
});

describe("steps", () => {
  it("runs isolation, typecheck and build in that order", () => {
    expect(STEPS.map(([label]) => label)).toEqual(["build isolation", "typecheck", "production build"]);
  });
});
