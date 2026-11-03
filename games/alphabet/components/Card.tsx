'use client';

import { motion } from 'framer-motion';

import type { CardData } from '@/games/alphabet/types';

interface CardProps {
  data: CardData;
  onClick: (id: number) => void;
  disabled: boolean;
}

export function Card({ data, onClick, disabled }: CardProps) {
  const isRevealed = data.isFlipped || data.isMatched;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={isRevealed ? data.letter : String(data.id)}
      className="relative aspect-square w-full perspective-1000 cursor-pointer disabled:cursor-not-allowed"
      onClick={() => onClick(data.id)}
    >
      <motion.div
        className="relative h-full w-full transform-style-3d"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-card border border-border backface-hidden shadow-card select-none ${
            data.isMatched
              ? 'bg-surface-muted text-fg-muted'
              : 'bg-surface text-primary group-hover:border-primary'
          }`}
        >
          <span className="text-sm font-bold md:text-base">{data.id}</span>
        </div>
        <div
          className={`absolute inset-0 flex rotate-y-180 items-center justify-center rounded-card border border-accent backface-hidden shadow-card select-none ${
            data.isMatched ? 'bg-success text-success-fg' : 'bg-accent text-accent-fg'
          }`}
        >
          <span className="text-lg font-extrabold md:text-2xl">{data.letter}</span>
        </div>
      </motion.div>
    </button>
  );
}
