'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { TRANSLATIONS } from '../constants';

export const OperatorGuide: React.FC = () => {
  const { setGuideOpen, setShowPrompt, closeAllModals, locale } = useGameStore();
  const t = TRANSLATIONS[locale];
  const g = t.guidePage;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shadow-xl shrink-0 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setGuideOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
              >
                {t.back}
              </button>
              <button 
                onClick={closeAllModals}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
              >
                {t.home}
              </button>
            </div>
            <div className="flex items-center gap-3 ml-2 border-l border-white/20 pl-4">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div>
                <h1 className="text-xl font-black uppercase italic tracking-tighter">{g.title}</h1>
                <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">{g.version}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setGuideOpen(false)}
            className="text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest hidden md:block"
          >
            [ESC]
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-16 pb-24 text-slate-700">
          
          {/* Grok Recommendation */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group border-4 border-indigo-400/30">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl font-black italic select-none group-hover:scale-110 transition-transform duration-500">AI</div>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner hidden md:block">
                <span className="text-4xl">🚀</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider italic">
                    {g.grokTitle}
                  </h3>
                  <span className="bg-amber-400 text-indigo-900 text-[10px] px-3 py-1 rounded-full font-black shadow-lg animate-pulse">{g.grokBadge}</span>
                </div>
                <p className="font-medium text-indigo-100 mb-6 leading-relaxed text-sm md:text-base max-w-2xl">
                  {g.grokText}<br/><br/>
                  <span className="text-indigo-200">{g.grokSaveHint}</span> {g.grokSaveText('.json')}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="https://grok.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2 group/btn"
                  >
                    {g.grokOpenBtn}
                    <svg className="group-hover/btn:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                  <button 
                    onClick={() => {
                      setGuideOpen(false);
                      setShowPrompt(true);
                    }}
                    className="bg-indigo-900/40 hover:bg-indigo-900/60 text-white border-2 border-indigo-300/30 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:border-indigo-300/60"
                  >
                    {g.grokPromptBtn}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 1: AI Content */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-black text-blue-100 italic select-none">01</span>
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">{g.section01Title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200">
                <h3 className="font-black text-blue-600 mb-4 uppercase text-sm tracking-widest">{g.multiTitle}</h3>
                <p className="text-sm leading-relaxed mb-6">
                  {g.multiText}
                </p>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 italic text-xs text-blue-800">
                  {g.multiTip}
                </div>
              </div>
              <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] text-9xl opacity-10 rotate-12">✨</div>
                <h3 className="font-black text-white mb-4 uppercase text-sm tracking-widest">{g.aiTitle}</h3>
                <p className="text-sm leading-relaxed mb-4">{g.aiText}</p>
                <ul className="text-xs space-y-2 font-medium opacity-90">
                  <li>• {g.aiBullet1}</li>
                  <li>• {g.aiBullet2}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Library Types */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-black text-blue-100 italic select-none">02</span>
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">{g.section02Title}</h2>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-xl font-black text-blue-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {g.systemTitle}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600 font-medium">
                      {g.systemText}
                    </p>
                    <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400 text-xs font-bold text-amber-900 leading-relaxed">
                      {g.systemNote}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-black text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                      {g.userTitle}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600 font-medium">
                      {g.userText}
                    </p>
                  </div>
                </div>
            </div>
          </section>

          {/* Section 3: Game Orchestration */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-black text-blue-100 italic select-none">03</span>
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">{g.section03Title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="text-3xl mb-4">⏸️</div>
                <h4 className="font-black text-slate-800 uppercase text-xs mb-2">{g.pauseTitle}</h4>
                <p className="text-xs leading-relaxed opacity-70">{g.pauseText}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="text-3xl mb-4">🖊️</div>
                <h4 className="font-black text-slate-800 uppercase text-xs mb-2">{g.editorTitle}</h4>
                <p className="text-xs leading-relaxed opacity-70">{g.editorText}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="text-3xl mb-4">💾</div>
                <h4 className="font-black text-slate-800 uppercase text-xs mb-2">{g.exportTitle}</h4>
                <p className="text-xs leading-relaxed opacity-70">{g.exportText}</p>
              </div>
            </div>
          </section>

          {/* Section 4: Game Settings */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-black text-blue-100 italic select-none">04</span>
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">{g.section04Title}</h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 pl-0">{g.section04Desc}</p>

            <div className="space-y-6">
              {/* Mode */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-8 py-4 flex items-center gap-3">
                  <span className="text-xl">🎮</span>
                  <h3 className="text-white font-black uppercase text-sm tracking-widest">{g.settingsMode}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-6 space-y-2">
                    <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg">{g.settingsModeWithQ}</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{g.settingsModeWithQDesc}</p>
                  </div>
                  <div className="p-6 space-y-2">
                    <div className="inline-flex items-center gap-2 bg-slate-200 text-slate-600 text-[10px] font-black uppercase px-3 py-1 rounded-lg">{g.settingsModeMemory}</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{g.settingsModeMemoryDesc}</p>
                  </div>
                </div>
              </div>

              {/* Suite + Teams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{g.settingsSuite}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{g.settingsSuiteDesc}</p>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👥</span>
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{g.settingsTeams}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{g.settingsTeamsDesc}</p>
                </div>
              </div>

              {/* Timers */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-blue-50 border-b border-slate-200 px-8 py-4 flex items-center gap-3">
                  <span className="text-xl">⏱️</span>
                  <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">{g.settingsTimers}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {[
                    { label: g.settingsTimerFlip,   range: '5–60',   desc: g.settingsTimerFlipDesc,   color: 'bg-blue-600' },
                    { label: g.settingsTimerLevel,  range: '3–30',   desc: g.settingsTimerLevelDesc,  color: 'bg-amber-500' },
                    { label: g.settingsTimerAnswer, range: '10–120', desc: g.settingsTimerAnswerDesc, color: 'bg-emerald-600' },
                  ].map((timer) => (
                    <div key={timer.label} className="p-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{timer.label}</span>
                        <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded ${timer.color}`}>{timer.range} сек</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{timer.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start tip */}
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-3xl">
                <p className="text-emerald-900 font-bold text-sm leading-relaxed">💡 {g.settingsStartTip}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <div className="p-6 bg-white border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{g.footerVersion}</p>
        </div>
        <p className="text-[10px] text-slate-400 font-bold max-w-md text-center md:text-right uppercase tracking-tighter opacity-60 italic">
          {g.footerTagline}
        </p>
      </div>
    </div>
  );
};
