'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { GameMode, GameSettings as SettingsType } from '../types';
import { DEFAULT_SETTINGS, TRANSLATIONS } from '../constants';
import { LocaleSelector } from './LocaleSelector';

export const GameSettings: React.FC = () => {
  const { 
    initializeGame, 
    setShowPrompt, 
    setAIGeneratorOpen, 
    setLibraryOpen, 
    setGuideOpen, 
    setAdminOpen, 
    loadCustomQuestions,
    saveToLibrary,
    questions, 
    library, 
    systemSuites, 
    aiConfig,
    locale,
  } = useGameStore();
  
  const t = TRANSLATIONS[locale];
  const totalSuitesCount = library.filter(s => s.language === locale).length + (systemSuites?.filter(s => s.language === locale).length || 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<SettingsType>({ 
    ...DEFAULT_SETTINGS, 
    questionsTopic: questions.currentSuite?.title || t.defaultTopic,
  });

  const handleNameChange = (idx: number, name: string) => {
    const newNames = [...settings.teamNames];
    newNames[idx] = name;
    setSettings({ ...settings, teamNames: newNames });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.questionsList && Array.isArray(json.questionsList)) {
          loadCustomQuestions(json); // Make active immediately
          saveToLibrary(json);       // Persist to library
          alert(t.suiteLoaded(json.title));
          
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          alert(t.invalidJson);
        }
      } catch (err) {
        alert(t.fileReadError);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-8 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
        <div className="bg-blue-600 md:w-1/4 p-10 flex flex-col justify-between text-white relative">
          <div>
            <h1 className="text-4xl font-black mb-4 leading-tight italic">{t.title}</h1>
            <p className="text-blue-100 text-sm opacity-80">{t.subtitle}</p>
          </div>
          
          <div className="space-y-4 my-8">
            {/* Language Selector */}
            <LocaleSelector />

            <button onClick={() => setAIGeneratorOpen(true)} className="w-full bg-amber-400 hover:bg-amber-500 text-blue-900 px-4 py-3 rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2">✨ {t.aiGenerator}</button>
            <button onClick={() => setLibraryOpen(true)} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2">📚 {t.library} ({totalSuitesCount})</button>
            
            {/* Direct JSON Import Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-xs font-bold transition-all border border-white/20 text-left flex items-center gap-2"
            >
              📥 {t.importJson}
            </button>

            <button onClick={() => setGuideOpen(true)} className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-xs font-bold transition-all border border-white/20 text-left flex items-center gap-2">📖 {t.guide}</button>
            <button onClick={() => setShowPrompt(true)} className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-xs font-bold transition-all border border-white/20 text-left flex items-center gap-2">🤖 {t.prompt}</button>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => setAdminOpen(true)} className="text-white/20 hover:text-white/40 transition-all text-[8px] uppercase font-black tracking-widest text-center">System Config v2.7</button>
            <a href="#rules" className="text-white/60 hover:text-white underline text-xs text-center">{t.rules}</a>
            <a href="/admin/login" className="text-white/40 hover:text-white/70 transition-all text-[10px] uppercase font-black tracking-widest text-center">Admin</a>
          </div>
        </div>

        <div className="flex-1 p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">{t.settings}</h2>
          <div className="space-y-8">
            {/* РЕЖИМ ИГРЫ */}
            <section>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3">{t.mode}</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSettings({ ...settings, gameMode: GameMode.WITH_QUESTIONS })}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] sm:text-xs transition-all border-2 ${settings.gameMode === GameMode.WITH_QUESTIONS ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                >
                  {t.withQuestions}
                </button>
                <button 
                  onClick={() => setSettings({ ...settings, gameMode: GameMode.WITHOUT_QUESTIONS })}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] sm:text-xs transition-all border-2 ${settings.gameMode === GameMode.WITHOUT_QUESTIONS ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                >
                  {t.withoutQuestions}
                </button>
              </div>
            </section>

            {settings.gameMode === GameMode.WITH_QUESTIONS && (
              <section className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">{t.activeSuite} ({aiConfig.provider})</label>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-blue-900">{questions.currentSuite?.title || t.notSelected}</span>
                  <button onClick={() => setLibraryOpen(true)} className="text-blue-600 font-bold text-xs uppercase hover:underline">{t.change}</button>
                </div>
              </section>
            )}

            <section>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3">{t.teamsCount}</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setSettings({ ...settings, teamsCount: n })} className={`flex-1 py-4 rounded-xl font-black text-xl transition-all ${settings.teamsCount === n ? 'bg-blue-600 text-white shadow-lg scale-105 z-10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{n}</button>
                ))}
              </div>
            </section>

            <section>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3">{t.teamNames}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: settings.teamsCount }).map((_, idx) => (
                  <input 
                    key={idx} 
                    type="text" 
                    value={settings.teamNames[idx]} 
                    onChange={(e) => handleNameChange(idx, e.target.value)} 
                    className="p-4 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 outline-none rounded-xl font-bold text-slate-700" 
                    placeholder={t.team + ` ${idx + 1}`} 
                  />
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-3">{t.flipTimer}</label>
                <input type="number" value={settings.flipTimer} onChange={(e) => setSettings({ ...settings, flipTimer: Number(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 outline-none rounded-xl font-bold text-slate-700" />
              </div>
              {settings.gameMode === GameMode.WITH_QUESTIONS && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-3">{t.levelTimer}</label>
                    <input type="number" value={settings.levelSelectTimer} onChange={(e) => setSettings({ ...settings, levelSelectTimer: Number(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 outline-none rounded-xl font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-3">{t.answerTimerLabel}</label>
                    <input type="number" value={settings.answerTimer} onChange={(e) => setSettings({ ...settings, answerTimer: Number(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 outline-none rounded-xl font-bold text-slate-700" />
                  </div>
                </>
              )}
            </section>
            
            <button onClick={() => initializeGame(settings)} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-2xl font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest mt-4">{t.start}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

