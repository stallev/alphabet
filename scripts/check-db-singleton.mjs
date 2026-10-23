#!/usr/bin/env node
/**
 * Ensures auth/db modules live only under server/ after R02-CU2 (no duplicate PrismaClient).
 * Contract: docs/implementation/contracts/repo_structure_contract.md §5 п. 1
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { importSpecifiers, isTestFile } from "./check-build-isolation.mjs";

export const LEGACY_AUTH_DB_PATHS = [
  "lib/db.ts",
  "lib/auth.ts",
  "lib/auth.config.ts",
  "src/data/auth/verify-credentials.server.ts",
];

export const LEGACY_IMPORT_PREFIXES = ["@/lib/db", "@/lib/auth", "@/src/data/auth/"];

/** Only this file may instantiate PrismaClient in application code (not prisma CLI scripts). */
export const PRISMA_SINGLETON_PATH = "server/db/client.ts";

export const SCAN_ROOTS = ["app", "games", "shared", "server", "lib", "src", "components"];
export const SCAN_FILES = ["proxy.ts"];

const SKIPPED_DIRS = new Set(["node_modules", ".next", "generated", "lint-fixtures"]);
const SOURCE_EXT = /\.(ts|tsx|mts|js|jsx|mjs)$/;
const PRISMA_NEW = /\bnew\s+PrismaClient\b/;

export function findLegacyFileViolations(rootDir) {
  return LEGACY_AUTH_DB_PATHS.filter((rel) => fs.existsSync(path.join(rootDir, rel))).map((rel) => ({
    path: rel,
    reason: "legacy auth/db module must be removed after git mv",
  }));
}

/** files: [{ path, content }] repo-relative posix paths. */
export function findLegacyImportViolations(files) {
  const violations = [];
  for (const file of files) {
    const filePath = file.path.replace(/\\/g, "/");
    if (isTestFile(filePath) || !SOURCE_EXT.test(filePath)) continue;
    for (const specifier of importSpecifiers(file.content)) {
      if (LEGACY_IMPORT_PREFIXES.some((prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`))) {
        violations.push({ path: filePath, specifier, reason: "legacy auth/db import" });
      }
    }
  }
  return violations;
}

/** files: [{ path, content }]; prisma/ seed scripts are excluded from scan. */
export function findDuplicatePrismaClientViolations(files) {
  const violations = [];
  for (const file of files) {
    const filePath = file.path.replace(/\\/g, "/");
    if (isTestFile(filePath) || !SOURCE_EXT.test(filePath)) continue;
    if (!PRISMA_NEW.test(file.content)) continue;
    if (filePath === PRISMA_SINGLETON_PATH) continue;
    violations.push({ path: filePath, reason: "new PrismaClient outside server/db/client.ts" });
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

export function collectScannedFiles(rootDir) {
  const paths = [];
  for (const dir of SCAN_ROOTS) walk(rootDir, dir, paths);
  for (const file of SCAN_FILES) {
    if (fs.existsSync(path.join(rootDir, file))) paths.push(file);
  }
  return paths.map((p) => ({
    path: p,
    content: fs.readFileSync(path.join(rootDir, p), "utf8"),
  }));
}

export function findDbSingletonViolations(rootDir) {
  const legacyFiles = findLegacyFileViolations(rootDir);
  const files = collectScannedFiles(rootDir);
  return [
    ...legacyFiles,
    ...findLegacyImportViolations(files),
    ...findDuplicatePrismaClientViolations(files),
  ];
}

function main() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const violations = findDbSingletonViolations(rootDir);
  if (violations.length > 0) {
    console.error("check-db-singleton:");
    for (const v of violations) {
      const detail = v.specifier ? `${v.specifier} (${v.reason})` : v.reason;
      console.error(`  ${v.path}: ${detail}`);
    }
    process.exit(1);
  }
  console.log("check-db-singleton: OK");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
