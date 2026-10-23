import Link from "next/link";

import { listGames } from "@/games/registry";
import type { ActiveLocale } from "@/shared/game-kit/manifest";

const CATALOG_LOCALE: ActiveLocale = "ru";

export default function HomePage() {
  const games = listGames();

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Игры</h1>
      {games.length === 0 ? (
        <p className="text-muted-foreground">Игр пока нет</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <li key={game.slug}>
              <Link
                href={`/${game.slug}`}
                className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <h2 className="font-semibold text-foreground">{game.title[CATALOG_LOCALE]}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{game.tagline[CATALOG_LOCALE]}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
