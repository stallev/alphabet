// Pre-commit gate: a commit that touches code or build configuration must leave the production
// build green. Runs only when relevant files are staged, so docs-only commits stay instant.
//   - check-build-isolation: no test files / test-only imports in the production build;
//   - typecheck of the whole project (including tests);
//   - `next build` (the same command Vercel runs).
// Contract: docs/implementation/contracts/precommit_build_gate_contract.md
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const AFFECTS_BUILD =
  /^(app|games|shared|server|prisma|public|types)\/.+\.(ts|tsx|mts|js|jsx|mjs|json|css|prisma|sql|webp|png|jpg|svg)$|^(proxy|next\.config|prisma\.config|eslint\.config|vitest\.config|postcss\.config|commitlint\.config)\.(ts|mjs|js)$|^package(-lock)?\.json$|^tsconfig[^/]*\.json$|^\.npmrc$|^scripts\/check-build-isolation\.mjs$/;

export function selectRelevant(stagedFiles) {
  return stagedFiles.filter((file) => AFFECTS_BUILD.test(file.replace(/\\/g, "/")));
}

export const STEPS = [
  ["build isolation", "node", ["scripts/check-build-isolation.mjs"]],
  ["typecheck", "npm", ["run", "typecheck"]],
  ["production build", "npm", ["run", "build"]],
];

function main() {
  const staged = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (selectRelevant(staged).length === 0) {
    console.log("precommit-build-check: no code or build config staged — skipped");
    process.exit(0);
  }

  for (const [label, command, args] of STEPS) {
    console.log(`\nprecommit-build-check → ${label}`);
    const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    if (result.status !== 0) {
      console.error(`\nprecommit-build-check: "${label}" failed — fix it before committing (the same step fails on Vercel).`);
      process.exit(result.status ?? 1);
    }
  }
  console.log("\nprecommit-build-check: OK");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
