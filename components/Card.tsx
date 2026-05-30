'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardData } from '../types';

interface CardProps {
  data: CardData;
  onClick: (id: number) => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ data, onClick, disabled }) => {
  const isRevealed = data.isFlipped || data.isMatched;

  return (
    <div 
      className="relative w-full h-full perspective-1000 cursor-pointer group"
      onClick={() => !disabled && onClick(data.id)}
    >
      <motion.div
        className="w-full h-full relative transition-all transform-style-3d"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      >
        {/* Front Side (Number) */}
        <div className={`absolute inset-0 backface-hidden flex items-center justify-center rounded-xl border-2 border-slate-300 shadow-md select-none transition-colors ${data.isMatched ? 'bg-slate-100 text-slate-300' : 'bg-white text-blue-900 group-hover:bg-blue-50 group-hover:border-blue-300'}`}>
          <span className="font-bold" style={{ fontSize: 'min(4vmin, 24px)' }}>
            {data.id}
          </span>
        </div>

        {/* Back Side (Letter) */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center rounded-xl border-2 border-blue-600 shadow-xl select-none ${data.isMatched ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-amber-400 text-white'}`}>
          <span className="font-black" style={{ fontSize: 'min(6vmin, 40px)' }}>
            {data.letter}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

