'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';

export const QuestionLibrary: React.FC = () => {
  const { library, deleteFromLibrary, loadCustomQuestions } = useGameStore();

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (library.length === 0) return null;

  return (
    <section className="mt-12 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
          📚 Моя Библиотека
          <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black">
            Хранение 3 дня
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {library.map((suite) => (
            <motion.div
              key={suite.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-black text-slate-800 text-lg leading-tight">{suite.title}</h4>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">
                    {suite.questionsList.length} вопр.
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-bold">
                  Создан: {formatDate(suite.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    loadCustomQuestions(suite);
                    alert(`Набор "${suite.title}" активирован!`);
                  }}
                  className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-blue-600 hover:text-white border-2 border-slate-200 hover:border-blue-600 rounded-xl font-black text-xs transition-all uppercase tracking-widest"
                >
                  Загрузить
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Вы уверены, что хотите навсегда удалить набор "${suite.title}" из библиотеки?`)) {
                      deleteFromLibrary(suite.id);
                    }
                  }}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Удалить из библиотеки"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

