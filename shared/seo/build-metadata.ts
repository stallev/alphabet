import type { Metadata } from "next";

import type { ActiveLocale } from "@/shared/domain/locale";
import { SITE } from "@/shared/config/site";

/** OpenGraph locale-код для активной локали. */
const OG_LOCALE: Record<ActiveLocale, string> = {
  ru: "ru_RU",
  en: "en_US",
};

/** Базовые robots в зависимости от indexable-флага сайта. */
const SITE_ROBOTS: Metadata["robots"] = SITE.indexable
  ? { index: true, follow: true }
  : { index: false, follow: false };

export interface BuildMetadataInput {
  locale: ActiveLocale;
  /** Канонический путь относительно корня сайта, напр. "/" или "/alphabet". */
  path: string;
  /** Заголовок страницы (без суффикса сайта — добавит template из layout). */
  title: string;
  /** Описание для meta description / og:description / twitter:description. */
  description: string;
  /** Override robots (напр. noindex для admin/dev/coming-soon). */
  robots?: Metadata["robots"];
  /** OG/Twitter-изображения. На корневом сегменте их подставляет файловая
   * конвенция `app/opengraph-image.png`; дочерние сегменты должны пробросить
   * `parent.openGraph.images` из `generateMetadata`, иначе переопределят. */
  images?: NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;
}

/**
 * Строит консистентный локаль-aware `Metadata` для публичных страниц.
 * `metadataBase` берётся из `SITE.url`, поэтому OG/Twitter-изображения
 * резолвятся в абсолютные URL. hreflang не добавляется — оба языка живут
 * на одном URL (cookie-based i18n, `i18n_contract.md` §1.4).
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  robots = SITE_ROBOTS,
  images,
}: BuildMetadataInput): Metadata {
  const url = new URL(path, SITE.url).href;

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url,
      locale: OG_LOCALE[locale],
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(SITE.twitter ? { site: SITE.twitter, creator: SITE.twitter } : {}),
    },
    robots,
  };
}
