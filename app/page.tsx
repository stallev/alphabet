import { listGames } from '@/games/registry';
import { SITE } from '@/shared/config/site';
import { getDictionary, getLocale } from '@/shared/i18n/server';
import { buildMetadata } from '@/shared/seo/build-metadata';

import { GameGrid } from './_components/GameGrid';
import { SiteFooter } from './_components/SiteFooter';
import { SiteHeader } from './_components/SiteHeader';

export async function generateMetadata() {
  const locale = await getLocale();
  const dictionary = await getDictionary();

  return buildMetadata({
    locale,
    path: '/',
    title: SITE.name,
    description: dictionary.site.description,
  });
}

export default async function HomePage() {
  const dictionary = await getDictionary();
  const games = listGames();

  return (
    <>
      <SiteHeader />
      <main className="pb-12 pt-8 md:pt-12">
        <section className="mx-auto max-w-[1120px] px-4 pb-10 md:px-6 xl:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-fg md:text-4xl">
            {dictionary.site.tagline}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-fg-muted md:text-lg">
            {dictionary.site.description}
          </p>
        </section>
        <section aria-labelledby="catalog-heading">
          <h2 id="catalog-heading" className="sr-only">
            {dictionary.catalog.title}
          </h2>
          {games.length === 0 ? (
            <div className="mx-auto max-w-lg px-4 text-center md:px-6">
              <p className="text-lg font-semibold text-fg">{dictionary.catalog.empty}</p>
              <p className="mt-2 text-sm text-fg-muted">{dictionary.site.description}</p>
            </div>
          ) : (
            <GameGrid games={games} />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
