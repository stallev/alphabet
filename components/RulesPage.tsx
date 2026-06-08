'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { SCORE_MATCH, SCORE_EASY, SCORE_MEDIUM, SCORE_HARD, TRANSLATIONS, ALPHABET_BY_LOCALE } from '../constants';

export const RulesPage: React.FC = () => {
  const { setGuideOpen, closeAllModals, locale } = useGameStore();
  const t = TRANSLATIONS[locale];
  const r = t.rulesPage;

  const cardCount = ALPHABET_BY_LOCALE[locale].length * 2;
  const pairCount = ALPHABET_BY_LOCALE[locale].length;

  const closeRules = () => {
    window.location.hash = '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-slate-100 overflow-y-auto flex flex-col"
    >
      {/* Header */}
      <div className="bg-blue-600 p-4 shadow-xl shrink-0 sticky top-0 z-50 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={closeRules}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
            >
              {t.back}
            </button>
            <button 
              onClick={() => {
                closeRules();
                closeAllModals();
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
            >
              {t.home}
            </button>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-right">{r.title}</h1>
            <p className="text-blue-200 text-[9px] font-black uppercase tracking-[0.2em] text-right">{r.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center py-12 px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl w-full bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden" 
          id="rules"
        >
          <div className="p-8 md:p-14 space-y-16 text-slate-700 leading-relaxed">
            
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-5 uppercase italic tracking-tight">
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">01</span>
                {r.section01Title}
              </h2>
              <p className="pl-16 text-lg">
                {r.section01Text(cardCount, pairCount)}
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-5 uppercase italic tracking-tight">
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">02</span>
                {r.section02Title}
              </h2>
              <div className="pl-16 space-y-8">
                <p className="text-lg">{r.section02Intro}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100 relative group overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:rotate-12 transition-transform">✅</div>
                    <h3 className="font-black text-emerald-700 mb-4 uppercase text-xs tracking-widest">{r.matchTitle}</h3>
                    <ul className="space-y-3 text-slate-700 text-sm font-bold">
                      <li>• {r.matchItem1(SCORE_MATCH)}</li>
                      <li>• {r.matchItem2}</li>
                      <li>• {r.matchItem3}</li>
                      <li>• <span className="text-emerald-600">{r.matchItem4}</span></li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 relative group overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:rotate-12 transition-transform">❌</div>
                    <h3 className="font-black text-slate-500 mb-4 uppercase text-xs tracking-widest">{r.missTitle}</h3>
                    <ul className="space-y-3 text-slate-700 text-sm font-bold opacity-80">
                      <li>• {r.missItem1}</li>
                      <li>• {r.missItem2}</li>
                      <li>• {r.missItem3}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-5 uppercase italic tracking-tight">
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">03</span>
                {r.section03Title}
              </h2>
              <div className="pl-16 overflow-hidden rounded-3xl border-2 border-slate-100">
                <table className="w-full text-left bg-slate-50/50">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-4">{r.tableAction}</th>
                      <th className="px-6 py-4 text-right">{r.tableReward}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-bold">
                    <tr>
                      <td className="px-6 py-4 text-slate-600">{r.rowMatch}</td>
                      <td className="px-6 py-4 text-right text-blue-600">{r.rowMatchPoints(SCORE_MATCH)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-emerald-600 italic">{r.rowEasy}</td>
                      <td className="px-6 py-4 text-right text-emerald-600">{r.rowEasyPoints(SCORE_EASY)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-amber-600 italic">{r.rowMedium}</td>
                      <td className="px-6 py-4 text-right text-amber-600">{r.rowMediumPoints(SCORE_MEDIUM)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-red-600 italic">{r.rowHard}</td>
                      <td className="px-6 py-4 text-right text-red-600">{r.rowHardPoints(SCORE_HARD)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-5 uppercase italic tracking-tight">
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">04</span>
                {r.section04Title}
              </h2>
              <div className="pl-16 space-y-6">
                <p className="text-lg">{r.section04Text}</p>
                <div className="bg-blue-50 border-l-8 border-blue-600 p-8 rounded-r-3xl">
                  <p className="text-blue-900 font-bold leading-relaxed">
                    {r.section04Note}
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center gap-10">
                <div className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🏁</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black mb-3 uppercase italic tracking-tight">{r.finishTitle}</h2>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {r.finishText}
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
          
          <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-center items-center gap-6">
            <button 
              onClick={closeRules}
              className="py-5 px-14 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-sm"
            >
              {r.mainMenuBtn}
            </button>
            <button 
              onClick={() => {
                setGuideOpen(true);
                closeRules();
              }}
              className="text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] transition-colors"
            >
              {r.openGuide}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
