#!/usr/bin/env node
/**
 * Design token lint — design_tokens_contract.md §3–§3.1
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = path.join(rootDir, "scripts", "tokens-baseline.json");

const SCAN_ROOTS = ["games", "shared"];
const EXTENSIONS = new Set([".tsx", ".css"]);
const SKIP_DIR_NAMES = new Set(["data", "i18n", "node_modules", ".next"]);
const SKIP_FILE_SUFFIXES = [".test.ts", ".test.tsx", ".test.mjs", ".test.js"];
const SKIP_BASENAMES = new Set(["tokens.css"]);

/** @type {{ id: string, regex: RegExp, test: (line: string, filePath: string) => boolean }[]} */
export const VIOLATION_RULES = [
  {
    id: "hex-color",
    regex: /#[0-9a-fA-F]{3,8}\b/,
    test: (line) => /#[0-9a-fA-F]{3,8}\b/.test(line),
  },
  {
    id: "raw-color-fn",
    regex: /\b(rgb|rgba|hsl|hsla)\(/,
    test: (line) => /\b(rgb|rgba|hsl|hsla)\(/.test(line),
  },
  {
    id: "palette-utility",
    regex:
      /\b(bg|text|border|ring|from|to|via|fill|stroke)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/,
    test: (line) =>
      /\b(bg|text|border|ring|from|to|via|fill|stroke)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/.test(
        line,
      ),
  },
  {
    id: "arbitrary-class",
    regex: /className=["'`][^"'`]*\[(\d+px|#[0-9a-fA-F]+)\]/,
    test: (line) => /className=["'`][^"'`]*\[(\d+px|#[0-9a-fA-F]+)\]/.test(line),
  },
  {
    id: "typography-ban",
    regex: /\b(uppercase|italic|font-black|tracking-(wider|widest))\b/,
    test: (line) => /\b(uppercase|italic|font-black|tracking-(wider|widest))\b/.test(line),
  },
  {
    id: "gradient-blur",
    regex: /\b(bg-(gradient|linear|radial)[\w-]*|blur-\w+|backdrop-blur[\w-]*|drop-shadow[\w-]*)\b/,
    test: (line) =>
      /\b(bg-(gradient|linear|radial)[\w-]*|blur-\w+|backdrop-blur[\w-]*|drop-shadow[\w-]*)\b/.test(line),
  },
  {
    id: "legacy-radius-shadow",
    regex: /\b(rounded|shadow)-(sm|md|lg|xl|2xl|3xl)\b/,
    test: (line) => /\b(rounded|shadow)-(sm|md|lg|xl|2xl|3xl)\b/.test(line),
  },
  {
    id: "emoji",
    regex: /\p{Extended_Pictographic}/u,
    test: (line) => /\p{Extended_Pictographic}/u.test(line),
  },
];

const ALLOW_MARKER = /tokens:allow\b/;

/**
 * @param {string} content
 * @param {string} relPath
 */
export function countViolationsInContent(content, relPath) {
  if (SKIP_BASENAMES.has(path.basename(relPath))) {
    return 0;
  }
  const lines = content.split(/\r?\n/);
  let count = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const prev = i > 0 ? lines[i - 1] : "";
    if (ALLOW_MARKER.test(prev)) {
      continue;
    }
    const line = lines[i];
    if (VIOLATION_RULES.some((rule) => rule.test(line, relPath))) {
      count += 1;
    }
  }
  return count;
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
export function collectScanFiles(dir) {
  /** @type {string[]} */
  const files = [];

  function walk(absDir, relDir) {
    if (!fs.existsSync(absDir)) {
      return;
    }
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
      const abs = path.join(absDir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIR_NAMES.has(entry.name)) {
          continue;
        }
        walk(abs, rel);
        continue;
      }
      const ext = path.extname(entry.name);
      if (!EXTENSIONS.has(ext)) {
        continue;
      }
      if (SKIP_FILE_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) {
        continue;
      }
      files.push(rel.replace(/\\/g, "/"));
    }
  }

  for (const root of SCAN_ROOTS) {
    walk(path.join(dir, root), root);
  }
  return files.sort();
}

/**
 * @param {string} dir
 * @param {{ alphabetOnly?: boolean }} [options]
 */
export function buildViolationMap(dir, options = {}) {
  /** @type {Record<string, number>} */
  const map = {};
  for (const rel of collectScanFiles(dir)) {
    if (options.alphabetOnly && !rel.startsWith("games/alphabet/")) {
      continue;
    }
    const abs = path.join(dir, rel);
    const content = fs.readFileSync(abs, "utf8");
    const count = countViolationsInContent(content, rel);
    if (count > 0) {
      map[rel] = count;
    }
  }
  return map;
}

/**
 * @param {string} dir
 */
export function loadBaseline(dir) {
  const file = path.join(dir, "scripts", "tokens-baseline.json");
  if (!fs.existsSync(file)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * @param {string} dir
 */
export function checkDesignTokens(dir) {
  /** @type {string[]} */
  const errors = [];
  const baseline = loadBaseline(dir);
  const files = collectScanFiles(dir);
  let baselineTotal = 0;
  let actualBaselineTotal = 0;

  for (const rel of files) {
    const abs = path.join(dir, rel);
    const content = fs.readFileSync(abs, "utf8");
    const count = countViolationsInContent(content, rel);
    const allowed = baseline[rel];

    if (allowed === undefined) {
      if (count > 0) {
        errors.push(`${rel}: ${count} violation(s) (not in baseline, expected 0)`);
      }
      continue;
    }

    baselineTotal += allowed;
    actualBaselineTotal += count;
    if (count > allowed) {
      errors.push(
        `${rel}: ${count} violation(s) exceeds baseline ${allowed}`,
      );
    }
  }

  return { errors, baselineTotal, actualBaselineTotal };
}

function writeBaseline(dir) {
  const map = buildViolationMap(dir, { alphabetOnly: true });
  const out = path.join(dir, "scripts", "tokens-baseline.json");
  fs.writeFileSync(out, `${JSON.stringify(map, null, 2)}\n`, "utf8");
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  console.log(`tokens-baseline: wrote ${Object.keys(map).length} files, total violations: ${total}`);
}

function main() {
  const writeMode = process.argv.includes("--write-baseline");
  if (writeMode) {
    writeBaseline(rootDir);
    return;
  }

  const { errors, baselineTotal, actualBaselineTotal } = checkDesignTokens(rootDir);
  console.log(
    `tokens:check baseline sum before=${baselineTotal} current=${actualBaselineTotal}`,
  );
  if (errors.length > 0) {
    for (const err of errors) {
      console.error(err);
    }
    process.exit(1);
  }
  console.log("tokens:check ok");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
