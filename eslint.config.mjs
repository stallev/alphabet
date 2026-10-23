import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const gamesDir = path.join(rootDir, "games");

/**
 * @param {string} [gamesRoot]
 * @returns {string[]}
 */
export function discoverGameSlugs(gamesRoot = gamesDir) {
  if (!fs.existsSync(gamesRoot)) {
    return [];
  }
  return fs
    .readdirSync(gamesRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name !== "_template" &&
        !entry.name.startsWith("."),
    )
    .map((entry) => entry.name)
    .sort();
}

/**
 * @param {string[]} gameSlugs
 * @returns {import('eslint').Linter.Config[]}
 */
export function createImportBoundaryConfigs(gameSlugs) {
  const configs = [];

  configs.push({
    files: ["shared/**/*.{ts,tsx,js,jsx,mjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/games/**", "@/games/*"],
              message: "shared must not import games (see repo_structure_contract §3)",
            },
            {
              group: ["@/server/**", "@/server/*"],
              message: "shared must not import server (see repo_structure_contract §3)",
            },
          ],
        },
      ],
    },
  });

  configs.push({
    files: ["server/**/*.{ts,tsx,js,jsx,mjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/games/**", "@/games/*"],
              message: "server must not import games (see repo_structure_contract §3)",
            },
          ],
        },
      ],
    },
  });

  for (const slug of gameSlugs) {
    const otherGamePatterns = gameSlugs
      .filter((other) => other !== slug)
      .flatMap((other) => [`@/games/${other}`, `@/games/${other}/*`, `@/games/${other}/**`]);

    configs.push({
      files: [`games/${slug}/**/*.{ts,tsx,js,jsx,mjs}`],
      ignores: [`games/${slug}/server/**`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...otherGamePatterns.map((pattern) => ({
                group: [pattern],
                message: `games/${slug} must not import another game (see repo_structure_contract §3)`,
              })),
              {
                group: ["@/server/**", "@/server/*"],
                message: `games/${slug} client code must not import server (see repo_structure_contract §3)`,
              },
              {
                group: ["@/app/**", "@/app/*"],
                message: "games must not import app routes (see repo_structure_contract §3)",
              },
            ],
          },
        ],
      },
    });

    configs.push({
      files: [`games/${slug}/server/**/*.{ts,tsx,js,jsx,mjs}`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...otherGamePatterns.map((pattern) => ({
                group: [pattern],
                message: `games/${slug}/server must not import another game (see repo_structure_contract §3)`,
              })),
              {
                group: ["@/app/**", "@/app/*"],
                message: "games must not import app routes (see repo_structure_contract §3)",
              },
            ],
          },
        ],
      },
    });
  }

  return configs;
}

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "generated/**",
    "docs/examples/**",
    "docs/archive/**",
    ".local/**",
    "scripts/lint-fixtures/**",
  ]),
  ...createImportBoundaryConfigs(discoverGameSlugs()),
  {
    rules: {
      // legacy: pre-R01 SPA store and UI used `any` and inline apostrophes in copy
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      // legacy: Timer resets duration via effect (Vite-era pattern)
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
