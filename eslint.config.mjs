import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";

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
  ]),
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
