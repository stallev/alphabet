/**
 * Глобальная конфигурация сайта — источник истины для SEO и брендинга.
 *
 * `url` — публичный URL прод-окружения (для `metadataBase`, OG/Twitter absolute URLs).
 * `indexable` — пока `false`: оба языка живут на одном URL, hreflang не применим
 * (см. `docs/implementation/contracts/i18n_contract.md` §1.4).
 */
export const SITE = {
  name: "Circle",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  indexable: false,
  ogImage: "/opengraph-image.png",
  twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
} as const;
