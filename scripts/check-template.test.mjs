import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(rootDir, "games", "_template");
const tmpDir = path.join(rootDir, "games", "tmp-check");

function patchFile(relativePath, replacer) {
  const filePath = path.join(tmpDir, relativePath);
  const next = replacer(fs.readFileSync(filePath, "utf8"));
  fs.writeFileSync(filePath, next);
}

function walkFiles(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, callback);
      continue;
    }
    if (/\.(ts|tsx|md)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

describe("games/_template copy workflow", () => {
  it("passes checks after slug rename in a temporary game folder", () => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.cpSync(templateDir, tmpDir, { recursive: true });

    try {
      walkFiles(tmpDir, (filePath) => {
        const original = fs.readFileSync(filePath, "utf8");
        const updated = original
          .replaceAll("@/games/_template", "@/games/tmp-check")
          .replaceAll('"template"', '"tmp-check"')
          .replaceAll("'template'", "'tmp-check'")
          .replaceAll("TEMPLATE_MANIFEST", "TMP_CHECK_MANIFEST");
        if (updated !== original) {
          fs.writeFileSync(filePath, updated);
        }
      });

      patchFile("manifest-data.ts", (content) =>
        content.replace("coming-soon", "active"),
      );
      patchFile("manifest.ts", (content) =>
        content.includes("loadPage")
          ? content
          : content.replace(
              "export default defineGame({",
              'export default defineGame({\n  loadPage: () => import("./page"),',
            ),
      );

      execSync("npm run typecheck", { cwd: rootDir, stdio: "pipe" });
      execSync("npm run lint", { cwd: rootDir, stdio: "pipe" });
      execSync("npx vitest run --exclude scripts/check-template.test.mjs", {
        cwd: rootDir,
        stdio: "pipe",
      });
      execSync("npm run tokens:check", { cwd: rootDir, stdio: "pipe" });

      walkFiles(tmpDir, (filePath) => {
        const text = fs.readFileSync(filePath, "utf8");
        expect(text.includes("template")).toBe(false);
      });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }, 180_000);
});
