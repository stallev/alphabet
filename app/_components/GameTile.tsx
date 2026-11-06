import type { GameTile as GameTileModel } from '@/shared/game-kit/manifest';
import { cn } from '@/shared/lib/cn';

const toneClasses: Record<GameTileModel['tone'], string> = {
  1: 'bg-game-1 text-game-1-fg',
  2: 'bg-game-2 text-game-2-fg',
  3: 'bg-game-3 text-game-3-fg',
  4: 'bg-game-4 text-game-4-fg',
  5: 'bg-game-5 text-game-5-fg',
};

export interface GameTileProps {
  tile: GameTileModel;
  muted?: boolean;
  className?: string;
}

export function GameTile({ tile, muted = false, className }: GameTileProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex aspect-[16/10] w-full items-center justify-center rounded-card text-4xl font-bold tabular-nums md:text-5xl',
        toneClasses[tile.tone],
        muted && 'opacity-70',
        className,
      )}
    >
      {tile.glyph}
    </div>
  );
}
