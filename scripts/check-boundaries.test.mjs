import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import {
  SHARED_IMPORTS_GAMES,
  SHARED_IMPORTS_SERVER,
  GAME_A_IMPORTS_GAME_B,
  GAME_A_IMPORTS_SERVER,
  SERVER_IMPORTS_GAMES,
} from "./lint-fixtures/boundary-violation.ts";
import { createImportBoundaryConfigs } from "../eslint.config.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BOUNDARY_SLUGS = ["a", "b"];

function createBoundaryEslint() {
  return new ESLint({
    cwd: rootDir,
    overrideConfig: [
      {
        files: ["**/*.{ts,tsx,js,jsx,mjs}"],
        languageOptions: {
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
          },
        },
      },
      ...createImportBoundaryConfigs(BOUNDARY_SLUGS),
    ],
  });
}

async function expectBoundaryViolation(filePath, code) {
  const eslint = createBoundaryEslint();
  const results = await eslint.lintText(code, { filePath: path.join(rootDir, filePath) });
  const messages = results.flatMap((result) => result.messages);
  const restricted = messages.filter((message) => message.ruleId === "no-restricted-imports");
  expect(restricted.length).toBeGreaterThan(0);
}

describe("import boundaries (ESLint)", () => {
  it("forbids shared → games", async () => {
    await expectBoundaryViolation("shared/lib/example.ts", SHARED_IMPORTS_GAMES);
  });

  it("forbids shared → server", async () => {
    await expectBoundaryViolation("shared/lib/example.ts", SHARED_IMPORTS_SERVER);
  });

  it("forbids games/a → games/b", async () => {
    await expectBoundaryViolation("games/a/components/Example.tsx", GAME_A_IMPORTS_GAME_B);
  });

  it("forbids games/a (non-server) → server", async () => {
    await expectBoundaryViolation("games/a/components/Example.tsx", GAME_A_IMPORTS_SERVER);
  });

  it("forbids server → games", async () => {
    await expectBoundaryViolation("server/db/example.ts", SERVER_IMPORTS_GAMES);
  });

  it("allows games/a/server → server", async () => {
    const eslint = createBoundaryEslint();
    const results = await eslint.lintText("import '@/server/db/client';", {
      filePath: path.join(rootDir, "games/a/server/example.server.ts"),
    });
    const restricted = results.flatMap((r) => r.messages).filter(
      (m) => m.ruleId === "no-restricted-imports",
    );
    expect(restricted).toHaveLength(0);
  });
});
