'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Confetti } from './Confetti';

export const VictoryScreen: React.FC = () => {
  const { teamScores, settings, resetGame, locale } = useGameStore();
  const t = TRANSLATIONS[locale];

  const results = settings.teamNames
    .slice(0, settings.teamsCount)
    .map((name, idx) => ({ name, score: teamScores[idx] || 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-blue-900/95 backdrop-blur-md p-6 overflow-hidden">
      <Confetti />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-12 max-w-2xl w-full text-center border-4 border-amber-400 relative z-10"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
          className="text-8xl mb-8"
        >
          🏆
        </motion.div>
        
        <h1 className="text-5xl font-black text-blue-900 mb-2 uppercase italic tracking-tighter">{t.victoryTitle}</h1>
        <p className="text-slate-500 mb-12 text-xl font-bold uppercase tracking-widest opacity-60">{t.leaderboard}</p>

        <div className="space-y-4 mb-12 overflow-y-auto max-h-[40vh] custom-scrollbar px-2">
          {results.map((res, idx) => {
            const isWinner = idx === 0;
            return (
              <motion.div 
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`p-6 rounded-[2rem] flex justify-between items-center ${isWinner ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-xl scale-105' : 'bg-slate-50'}`}
              >
                <div className="flex items-center gap-6">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${isWinner ? 'bg-white text-amber-500 shadow-inner' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <span className={`text-2xl font-black ${isWinner ? 'text-white' : 'text-slate-800'}`}>{res.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-3xl font-black ${isWinner ? 'text-white' : 'text-blue-900'}`}>{res.score}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isWinner ? 'text-white/60' : 'text-slate-400'}`}>{t.points}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button 
          onClick={resetGame}
          className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-2xl font-black shadow-xl transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
        >
          {t.mainMenu}
        </button>
      </motion.div>
    </div>
  );
};

