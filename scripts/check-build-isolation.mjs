#!/usr/bin/env node
/**
 * Build isolation: production code must not depend on test tooling or test files.
 * Scans app/, games/, shared/, server/ and proxy.ts. Test files themselves (*.test.*, *.spec.*, __tests__/) are skipped.
 * Contract: docs/implementation/contracts/precommit_build_gate_contract.md §3
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SCAN_ROOTS = ["app", "games", "shared", "server"];
export const SCAN_FILES = ["proxy.ts"];
const SKIPPED_DIRS = new Set(["node_modules", ".next", "generated", "lint-fixtures"]);
const SOURCE_EXT = /\.(ts|tsx|mts|js|jsx|mjs)$/;
const TEST_FILE = /\.(test|spec)\.[a-z]+$|(^|\/)__tests__\//;
const TEST_ONLY_PACKAGES = /^(vitest|@vitest\/|@testing-library\/|jsdom|happy-dom|playwright|@playwright\/)/;
const IMPORT_SPEC =
  /(?:^|\n)\s*(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|(?:^|\n)\s*import\s*['"]([^'"]+)['"]|\b(?:import|require)\(\s*['"]([^'"]+)['"]\s*\)/g;

export function isTestFile(filePath) {
  return TEST_FILE.test(filePath.replace(/\\/g, "/"));
}

export function importSpecifiers(content) {
  const specs = [];
  for (const match of String(content).matchAll(IMPORT_SPEC)) specs.push(match[1] ?? match[2] ?? match[3]);
  return specs;
}

/** files: [{ path, content }] with repo-relative posix paths. Returns [{ path, specifier, reason }]. */
export function findIsolationViolations(files) {
  const violations = [];
  for (const file of files) {
    const filePath = file.path.replace(/\\/g, "/");
    if (isTestFile(filePath) || !SOURCE_EXT.test(filePath)) continue;
    for (const specifier of importSpecifiers(file.content)) {
      if (TEST_ONLY_PACKAGES.test(specifier)) violations.push({ path: filePath, specifier, reason: "test-only package" });
      else if (specifier.startsWith(".") || specifier.startsWith("@/")) {
        if (isTestFile(specifier) || /\.(test|spec)(\.[a-z]+)?$/.test(specifier)) {
          violations.push({ path: filePath, specifier, reason: "imports a test file" });
        }
      }
    }
  }
  return violations;
}

function walk(rootDir, relative, out) {
  const absolute = path.join(rootDir, relative);
  if (!fs.existsSync(absolute)) return;
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const child = path.posix.join(relative.replace(/\\/g, "/"), entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) walk(rootDir, child, out);
    } else if (SOURCE_EXT.test(entry.name)) {
      out.push(child);
    }
  }
}

function main() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const paths = [];
  for (const dir of SCAN_ROOTS) walk(rootDir, dir, paths);
  for (const file of SCAN_FILES) if (fs.existsSync(path.join(rootDir, file))) paths.push(file);
  const files = paths.map((p) => ({ path: p, content: fs.readFileSync(path.join(rootDir, p), "utf8") }));
  const violations = findIsolationViolations(files);
  if (violations.length > 0) {
    console.error("check-build-isolation: production code depends on tests:");
    for (const v of violations) console.error(`  ${v.path}: ${v.specifier} (${v.reason})`);
    process.exit(1);
  }
  console.log(`check-build-isolation: OK (${files.length} files)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
