import type { ActiveLocale, GameEntry, GameManifest, GameTag } from "@/shared/game-kit/manifest";
import { GAME_TAGS } from "@/shared/game-kit/manifest";

import alphabet from "./alphabet/manifest";
import { RESERVED_SLUGS } from "./reserved-slugs";

const SLUG_PATTERN = /^[a-z][a-z0-9-]{1,31}$/;

const TEXT_LIMITS: Record<"title" | "tagline" | "description", number> = {
  title: 40,
  tagline: 80,
  description: 400,
};

const ACTIVE_LOCALES: ActiveLocale[] = ["ru", "en"];

export const GAME_ENTRIES: readonly GameEntry[] = [alphabet];

export function sortGameManifests(manifests: readonly GameManifest[]): GameManifest[] {
  return [...manifests].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.slug.localeCompare(b.slug);
  });
}

export function listGames(): GameManifest[] {
  return sortGameManifests(GAME_ENTRIES.map((entry) => entry.manifest));
}

export function getGameEntry(slug: string): GameEntry | undefined {
  return GAME_ENTRIES.find((entry) => entry.manifest.slug === slug);
}

function validateLocalizedText(
  slug: string,
  field: "title" | "tagline" | "description",
  value: GameManifest["title"],
): void {
  const limit = TEXT_LIMITS[field];
  for (const locale of ACTIVE_LOCALES) {
    const text = value[locale];
    if (!text || text.trim().length === 0) {
      throw new Error(`manifest "${slug}": ${field}.${locale} must not be empty`);
    }
    if (text.length > limit) {
      throw new Error(
        `manifest "${slug}": ${field}.${locale} exceeds ${limit} characters`,
      );
    }
  }
}

function validateTags(slug: string, tags: readonly GameTag[]): void {
  if (tags.length === 0) {
    throw new Error(`manifest "${slug}": tags must include at least one tag`);
  }
  if (tags.length > 4) {
    throw new Error(`manifest "${slug}": tags must not exceed 4 tags`);
  }
  const allowed = new Set<string>(GAME_TAGS);
  for (const tag of tags) {
    if (!allowed.has(tag)) {
      throw new Error(`manifest "${slug}": tags contains unknown tag "${tag}"`);
    }
  }
}

function validateTeams(slug: string, teams: GameManifest["teams"]): void {
  if (teams.min < 1) {
    throw new Error(`manifest "${slug}": teams.min must be at least 1`);
  }
  if (teams.min > teams.max) {
    throw new Error(`manifest "${slug}": teams.min must not exceed teams.max`);
  }
}

function validateManifest(manifest: GameManifest): void {
  const { slug } = manifest;
  validateLocalizedText(slug, "title", manifest.title);
  validateLocalizedText(slug, "tagline", manifest.tagline);
  validateLocalizedText(slug, "description", manifest.description);
  validateTags(slug, manifest.tags);
  validateTeams(slug, manifest.teams);
  if (manifest.status === "active" && !manifest.cover) {
    throw new Error(`active game "${slug}" has no cover`);
  }
}

export function assertValidRegistry(entries: readonly GameEntry[]): void {
  const seenSlugs = new Set<string>();

  for (const entry of entries) {
    const { slug } = entry.manifest;

    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(`invalid slug "${slug}"`);
    }
    if (RESERVED_SLUGS.includes(slug)) {
      throw new Error(`reserved slug "${slug}"`);
    }
    if (seenSlugs.has(slug)) {
      throw new Error(`duplicate slug "${slug}"`);
    }
    seenSlugs.add(slug);

    if (entry.manifest.status === "active" && !entry.loadPage) {
      throw new Error(`active game "${slug}" has no loadPage`);
    }
    if (entry.manifest.status === "coming-soon" && entry.loadPage) {
      throw new Error(`coming-soon game "${slug}" must not have loadPage`);
    }

    validateManifest(entry.manifest);
  }
}
