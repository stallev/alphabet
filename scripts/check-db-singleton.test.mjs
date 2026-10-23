import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

import {
  PRISMA_SINGLETON_PATH,
  collectScannedFiles,
  findDbSingletonViolations,
  findDuplicatePrismaClientViolations,
  findLegacyFileViolations,
  findLegacyImportViolations,
} from "./check-db-singleton.mjs";

describe("db singleton guard", () => {
  it("flags legacy auth/db files on disk", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "db-singleton-"));
    fs.mkdirSync(path.join(tmp, "lib"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "lib/db.ts"), "export {}");
    expect(findLegacyFileViolations(tmp)).toEqual([
      { path: "lib/db.ts", reason: "legacy auth/db module must be removed after git mv" },
    ]);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("flags legacy @/lib/db imports", () => {
    const violations = findLegacyImportViolations([
      { path: "app/x.ts", content: "import { prisma } from '@/lib/db';" },
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0].specifier).toBe("@/lib/db");
  });

  it("allows only server/db/client.ts to construct PrismaClient", () => {
    const violations = findDuplicatePrismaClientViolations([
      { path: PRISMA_SINGLETON_PATH, content: "new PrismaClient()" },
      { path: "lib/db.ts", content: "new PrismaClient()" },
    ]);
    expect(violations.map((v) => v.path)).toEqual(["lib/db.ts"]);
  });

  it("repo has no legacy auth/db modules or duplicate PrismaClient", () => {
    const violations = findDbSingletonViolations(rootDir);
    expect(violations).toEqual([]);
    const scanned = collectScannedFiles(rootDir);
    const prismaHosts = scanned.filter((f) => /\bnew\s+PrismaClient\b/.test(f.content)).map((f) => f.path);
    expect(prismaHosts).toEqual([PRISMA_SINGLETON_PATH]);
  });
});
