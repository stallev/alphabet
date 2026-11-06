import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { type Locale } from "@/shared/domain/locale";
import type { ActiveLocale } from "@/shared/game-kit/manifest";
import { SITE } from "@/shared/config/site";
import {
  assertValidRegistry,
  GAME_ENTRIES,
  getGameEntry,
} from "@/games/registry";
import { getLocale } from "@/shared/i18n/server";
import { buildMetadata } from "@/shared/seo/build-metadata";

import { ComingSoon } from "./ComingSoon";

function toActiveLocale(locale: Locale): ActiveLocale {
  return locale === "en" ? "en" : "ru";
}

/** Unknown slugs → static 404 (`game_routing_contract.md` §2). */
export const dynamicParams = false;

export function generateStaticParams(): { game: string }[] {
  assertValidRegistry(GAME_ENTRIES);
  return GAME_ENTRIES.map((entry) => ({ game: entry.manifest.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ game: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { game: slug } = await params;
  const entry = getGameEntry(slug);
  if (!entry) {
    return {};
  }

  const locale = toActiveLocale(await getLocale());
  const { manifest } = entry;
  const parentMeta = await parent;
  const images = parentMeta.openGraph?.images;

  return buildMetadata({
    locale,
    path: `/${slug}`,
    title: manifest.title[locale],
    description: manifest.description[locale],
    robots:
      manifest.status === "coming-soon"
        ? { index: false, follow: false }
        : SITE.indexable
          ? { index: true, follow: true }
          : { index: false, follow: false },
    images,
  });
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
    return <ComingSoon manifest={entry.manifest} />;
  }

  if (!entry.loadPage) {
    notFound();
  }

  const { default: Page } = await entry.loadPage();
  const locale: Locale = await getLocale();

  return <Page locale={locale} />;
}
