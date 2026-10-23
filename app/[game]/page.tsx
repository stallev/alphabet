import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, type Locale } from "@/shared/domain/locale";
import type { ActiveLocale } from "@/shared/game-kit/manifest";
import { SITE } from "@/shared/config/site";
import {
  assertValidRegistry,
  GAME_ENTRIES,
  getGameEntry,
} from "@/games/registry";

function toActiveLocale(locale: Locale): ActiveLocale {
  return locale === "en" ? "en" : "ru";
}

/** Unknown slugs → static 404 (`game_routing_contract.md` §2; incompatible with `cacheComponents`). */
export const dynamicParams = false;

export function generateStaticParams(): { game: string }[] {
  assertValidRegistry(GAME_ENTRIES);
  return GAME_ENTRIES.map((entry) => ({ game: entry.manifest.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const entry = getGameEntry(slug);
  if (!entry) {
    return {};
  }

  const locale = toActiveLocale(DEFAULT_LOCALE);
  const { manifest } = entry;

  return {
    title: `${manifest.title[locale]} — ${SITE.name}`,
    description: manifest.description[locale],
    robots: SITE.indexable ? "index, follow" : "noindex, nofollow",
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<ReactNode> {
  const { game: slug } = await params;
  const entry = getGameEntry(slug);

  if (!entry) {
    notFound();
  }

  if (entry.manifest.status === "coming-soon") {
    notFound();
  }

  if (!entry.loadPage) {
    notFound();
  }

  const { default: Page } = await entry.loadPage();
  const locale = DEFAULT_LOCALE;

  return <Page locale={locale} />;
}
