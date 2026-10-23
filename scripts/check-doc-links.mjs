#!/usr/bin/env node
/**
 * Relative links in tracked markdown / rules must resolve.
 * Forward references (documents created in later R01 CUs) are allowed via FUTURE_*.
 * Read-only trees and build output are not scanned.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXCLUDED_PREFIXES = ["docs/examples/", "docs/archive/", "node_modules/", ".next/"];
const FUTURE_PREFIXES = [
  "docs/guidelines/",
  "docs/prompts/",
  "docs/meta/templates/",
  ".cursor/agents/",
  ".cursor/skills/",
];
const FUTURE_FILES = new Set([
  "docs/meta/project_quality_profile.md",
  "docs/meta/ai_first_methodology.md",
  "docs/meta/ai_agent_model_routing.md",
  "docs/meta/phase_tasks.template.md",
  "docs/meta/documentation_registry.md",
  ".cursor/rules/project-context.mdc",
  ".cursor/rules/README.md",
  "AGENTS.md",
  "README.md",
  ".cursorignore",
  "eslint.config.mjs",
  "vitest.config.mjs",
  "commitlint.config.mjs",
  ".github/workflows/ci.yml",
  "docs/architecture/database_schema.md",
  "docs/architecture/migration-best-practices.md",
  ".cursor/rules/product-docs-alignment.mdc",
  ".cursor/rules/agent-commit-pipeline.mdc",
  ".cursor/rules/agent-code-review-subagent.mdc",
  ".cursor/rules/model-routing.mdc",
  ".cursor/rules/ai-dry-deduplication.mdc",
  ".cursor/rules/domain-literals-and-codes.mdc",
  ".cursor/rules/typescript-types.mdc",
]);

const toPosix = (filePath) => filePath.split(path.sep).join("/");

function listTrackedDocs() {
  const output = execFileSync("git", ["ls-files", "-z"], { cwd: rootDir, encoding: "utf8" });
  return output
    .split("\0")
    .filter((file) => /\.(md|mdc)$/.test(file))
    .filter((file) => !EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix)))
    .filter((file) => fs.existsSync(path.join(rootDir, file)));
}

function listTierRuleNames() {
  const tiersDir = path.join(rootDir, ".cursor", "rules", "tiers");
  if (!fs.existsSync(tiersDir)) {
    return new Set();
  }
  return new Set(
    fs.readdirSync(tiersDir).flatMap((tier) => {
      const tierDir = path.join(tiersDir, tier);
      return fs.statSync(tierDir).isDirectory() ? fs.readdirSync(tierDir) : [];
    }),
  );
}
const tierRuleNames = listTierRuleNames();

function isIllustrativeLink(link) {
  return /[…]|\/path\/|\{[A-Za-z]/.test(link.replace(/\{\{[A-Z_]+\}\}/g, ""));
}

function placeholderFreeLink(link) {
  const placeholderIndex = link.indexOf("{{");
  if (placeholderIndex === -1) {
    return link;
  }
  const folder = link.slice(0, placeholderIndex).replace(/[^/]*$/, "");
  return folder || null;
}

function isAllowedMissing(target) {
  const asFolder = `${target}/`;
  if (FUTURE_FILES.has(target) || FUTURE_PREFIXES.some((prefix) => target.startsWith(prefix) || asFolder === prefix)) {
    return true;
  }
  const activatedRule = target.match(/^\.cursor\/rules\/([^/]+\.mdc)$/);
  return Boolean(activatedRule && tierRuleNames.has(activatedRule[1]));
}

function candidateTargets(file, link) {
  const fileDir = path.posix.dirname(toPosix(file));
  const candidates = [path.posix.normalize(path.posix.join(fileDir, link))];
  if (file.startsWith(".cursor/")) {
    candidates.push(path.posix.normalize(link), path.posix.normalize(path.posix.join(".cursor/rules", link)));
  }
  return candidates.map((candidate) => candidate.replace(/\/$/, ""));
}

const problems = [];
for (const file of listTrackedDocs()) {
  const text = fs
    .readFileSync(path.join(rootDir, file), "utf8")
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, (block) => block.replace(/[^\n]/g, ""));
  for (const match of text.matchAll(/\]\(([^)\s#]+)(#[^)\s]*)?\)/g)) {
    const rawLink = decodeURI(match[1]);
    if (/^[a-z]+:/i.test(rawLink) || isIllustrativeLink(rawLink)) {
      continue;
    }
    const link = placeholderFreeLink(rawLink);
    if (link === null) {
      continue;
    }
    const candidates = candidateTargets(file, link);
    const escapesRoot = candidates.every((candidate) => candidate.startsWith(".."));
    const resolves = candidates.some((candidate) => fs.existsSync(path.join(rootDir, candidate)));
    if (!escapesRoot && (resolves || candidates.some(isAllowedMissing))) {
      continue;
    }
    const line = text.slice(0, match.index).split("\n").length;
    problems.push(`${file}:${line}: ${link}`);
  }
}

if (problems.length) {
  console.error(`docs:links — ${problems.length} broken link(s):`);
  for (const problem of problems) console.error(`  ${toPosix(problem)}`);
  process.exit(1);
}
console.log("docs:links — all relative links resolve (or point to documents created later).");
