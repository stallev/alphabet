'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { AIProvider } from '../types';
import { TRANSLATIONS } from '../constants';

const OPENROUTER_MODELS = [
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', desc: 'Мощная модель от Alibaba. Превосходное знание текстов и структуры.' },
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3 (Free)', desc: 'Очень быстрая и умная модель. Отлично подходит для генерации списков.' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', desc: 'Модель с цепочкой рассуждений. Генерирует долго, но очень качественно.' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', desc: 'Легкая и надежная модель. Высокий шанс доступности при перегрузках других провайдеров.' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', desc: 'Надежный стандарт от Meta. Хорошо справляется с большими объемами.' },
];

export const AdminSettings: React.FC = () => {
  const { aiConfig, updateAIConfig, setAdminOpen, closeAllModals, locale } = useGameStore();
  const [secret, setSecret] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const t = TRANSLATIONS[locale];

  const handleUnlock = () => {
    if (secret === '19082006!') {
      setIsUnlocked(true);
    } else {
      alert('НЕВЕРНЫЙ КОД ДОСТУПА');
      setSecret('');
    }
  };

  const handleProviderSwitch = (provider: AIProvider) => {
    if (provider === 'google') {
      updateAIConfig({ provider: 'google', model: 'gemini-3-flash-preview' });
    } else {
      updateAIConfig({ provider: 'openrouter', model: OPENROUTER_MODELS[0].id });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950 font-mono overflow-y-auto custom-scrollbar flex flex-col">
      {/* Header */}
      {isUnlocked && (
        <div className="bg-black/50 border-b border-white/10 p-4 sticky top-0 z-50 backdrop-blur-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setAdminOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
              >
                {t.back}
              </button>
              <button 
                onClick={closeAllModals}
                className="bg-red-900/50 hover:bg-red-900 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
              >
                {t.home}
              </button>
            </div>
            <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest animate-pulse">System Override Active</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start py-12 px-6">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div 
              key="lock"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full bg-slate-900 border-2 border-red-500/30 p-10 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center my-auto"
            >
              <div className="text-5xl mb-6 grayscale">🔒</div>
              <h2 className="text-red-500 font-black text-xl mb-8 uppercase tracking-widest">System Override Required</h2>
              <input 
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="ENTER SECRET KEY..."
                className="w-full bg-black/50 border-2 border-red-500/20 p-4 rounded-xl text-red-500 text-center text-2xl outline-none focus:border-red-500 transition-all mb-6"
              />
              <div className="flex gap-4">
                <button onClick={handleUnlock} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all">Unlock</button>
                <button onClick={() => setAdminOpen(false)} className="px-6 py-4 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all">Exit</button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl w-full bg-slate-900 border border-emerald-500/20 p-8 rounded-3xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10 border-b border-emerald-500/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-tighter">AI Core Configuration</h2>
                  <p className="text-emerald-500/50 text-xs">Environment: Production | Access: Admin</p>
                </div>
              </div>

              <div className="space-y-10">
                <section>
                  <label className="block text-emerald-500/40 text-[10px] uppercase font-black mb-4 tracking-widest">Select Engine Provider</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleProviderSwitch('openrouter')}
                      className={`p-6 rounded-2xl border-2 transition-all text-left ${aiConfig.provider === 'openrouter' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                      <span className="block text-emerald-500 font-black text-lg">OpenRouter</span>
                      <span className="text-[10px] text-slate-500 uppercase italic">Free Multi-Model Hub</span>
                    </button>
                    <button 
                      onClick={() => handleProviderSwitch('google')}
                      className={`p-6 rounded-2xl border-2 transition-all text-left ${aiConfig.provider === 'google' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                      <span className="block text-emerald-500 font-black text-lg">Google Native</span>
                      <span className="text-[10px] text-slate-500 uppercase italic">Direct SDK Mode</span>
                    </button>
                  </div>
                </section>

                {aiConfig.provider === 'openrouter' && (
                  <motion.section initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <label className="block text-emerald-500/40 text-[10px] uppercase font-black mb-4 tracking-widest">Available Verified Free Models</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {OPENROUTER_MODELS.map(m => (
                        <button 
                          key={m.id}
                          onClick={() => updateAIConfig({ model: m.id })}
                          className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col ${aiConfig.model === m.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700'}`}
                        >
                          <span className="text-emerald-500 font-bold text-sm">{m.name}</span>
                          <span className="text-[10px] text-slate-500 mt-1">{m.desc}</span>
                          <code className="mt-2 text-[9px] text-emerald-500/30 truncate">{m.id}</code>
                        </button>
                      ))}
                    </div>
                  </motion.section>
                )}

                <div className="bg-black/40 p-6 rounded-2xl border border-emerald-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-500 text-[10px] font-black uppercase">Configuration Active</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    System is currently using <span className="text-emerald-500 font-bold">{aiConfig.provider.toUpperCase()}</span>.
                    Model: <code className="text-emerald-500">{aiConfig.model}</code>.
                    <br /><br />
                    <span className="text-amber-500 font-bold">Важно:</span> Бесплатные модели OpenRouter имеют лимиты. Если вы видите ошибку "No endpoints found", выберите другую модель из списка или подождите несколько минут.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

