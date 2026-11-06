import type { GameManifest } from '@/shared/game-kit/manifest';

import { GameCard } from './GameCard';

export interface GameGridProps {
  games: GameManifest[];
}

export function GameGrid({ games }: GameGridProps) {
  return (
    <ul className="mx-auto grid max-w-[1120px] grid-cols-1 items-stretch gap-4 px-4 md:grid-cols-2 md:gap-6 md:px-6 xl:grid-cols-3 xl:gap-8 xl:px-8">
      {games.map((manifest) => (
        <li key={manifest.slug} className="h-full max-w-xs md:max-w-none">
          <GameCard manifest={manifest} />
        </li>
      ))}
    </ul>
  );
}
