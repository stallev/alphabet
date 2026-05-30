'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { GameMode, Locale } from '../types';
import { TRANSLATIONS } from '../constants';

export const ScoreBoard: React.FC = () => {
  const { settings, teamScores, currentTeamIndex, finishGame, isGameOver, isPaused, togglePause, toggleMute, isMuted, locale } = useGameStore();
  const t = TRANSLATIONS[locale];

  const FINISH_CONFIRM: Record<Locale, string> = {
    ru: "Вы уверены, что хотите завершить игру сейчас? Будут подведены итоги по текущим баллам.",
    en: "Are you sure you want to finish the game now? Results will be calculated based on current scores.",
    uk: "Ви впевнені, що хочете завершити гру зараз? Підсумки будуть підведені за поточними балами.",
    de: "Möchten Sie das Spiel jetzt beenden? Die Ergebnisse werden anhand der aktuellen Punkte berechnet.",
    ro: "Ești sigur că vrei să termini jocul acum? Rezultatele vor fi calculate pe baza punctelor actuale.",
  };

  const handleFinish = () => {
    if (window.confirm(FINISH_CONFIRM[locale])) {
      finishGame();
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur shadow-lg sticky top-0 z-30 px-6 py-4 flex flex-col gap-4 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
          {settings.teamNames.slice(0, settings.teamsCount).map((name, idx) => {
            const isActive = idx === currentTeamIndex && !isGameOver;
            return (
              <motion.div 
                key={idx}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -4 : 0,
                  opacity: isPaused ? 0.4 : 1,
                  backgroundColor: isActive ? '#2563eb' : '#f1f5f9', // blue-600 : slate-100
                  color: isActive ? '#ffffff' : '#475569'
                }}
                // Add explicit pop animation on active change
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`p-3 rounded-2xl min-w-[140px] flex flex-col items-center transition-shadow relative ${
                  isActive 
                    ? 'shadow-xl ring-4 ring-blue-300 z-10' 
                    : ''
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -top-2 right-0 bg-amber-400 text-blue-900 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Active
                  </motion.div>
                )}
                <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">
                  {isActive ? t.turnOf : t.team}
                </span>
                <span className="text-lg font-black truncate max-w-full">{name}</span>
                <span className="text-2xl font-black mt-1 leading-none">
                  {teamScores[idx] || 0}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-2 items-center shrink-0">
          <div className="hidden lg:flex flex-col items-end justify-center mr-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.mode}</span>
            <span className="text-sm font-black text-slate-700">
              {settings.gameMode === GameMode.WITH_QUESTIONS ? t.withQuestions : t.withoutQuestions}
            </span>
          </div>
          
          <button 
            onClick={toggleMute}
            className={`p-3 rounded-xl font-black transition-all shadow-md active:scale-95 ${
              isMuted ? 'bg-slate-200 text-slate-400' : 'bg-white text-blue-600 border border-blue-100'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {!isGameOver && (
            <>
              <button 
                onClick={togglePause}
                className={`px-4 py-3 rounded-xl font-black text-xs transition-all shadow-md uppercase tracking-widest cursor-pointer flex items-center gap-2 ${
                  isPaused 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse ring-4 ring-emerald-200' 
                    : 'bg-slate-800 hover:bg-black text-white'
                }`}
              >
                {isPaused ? `▶` : `⏸`}
              </button>
              <button 
                onClick={handleFinish}
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-4 py-3 rounded-xl font-black text-xs transition-all shadow-md uppercase tracking-widest cursor-pointer"
              >
                {t.finish}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

