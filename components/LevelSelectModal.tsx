'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { ComplexityLevel } from '../types';
import { Timer } from './Timer';
import { TRANSLATIONS, SCORE_EASY, SCORE_MEDIUM, SCORE_HARD } from '../constants';

export const LevelSelectModal: React.FC = () => {
  const { temp, questions, settings, selectComplexity, locale, closeLevelSelect } = useGameStore();
  const t = TRANSLATIONS[locale];

  if (!temp.showLevelSelect) return null;

  const getRemainingCount = (level: ComplexityLevel) => {
    if (!questions.currentSuite) return 0;
    return questions.currentSuite.questionsList.filter(q => 
      q.complexityLevel === level && !questions.answeredQuestionIds.includes(q.id)
    ).length;
  };

  const easyCount = getRemainingCount(ComplexityLevel.EASY);
  const mediumCount = getRemainingCount(ComplexityLevel.MEDIUM);
  const hardCount = getRemainingCount(ComplexityLevel.HARD);

  const hasAnyQuestions = easyCount > 0 || mediumCount > 0 || hardCount > 0;

  const handleAutoSelect = () => {
    if (easyCount > 0) {
      selectComplexity(ComplexityLevel.EASY);
    } else if (mediumCount > 0) {
      selectComplexity(ComplexityLevel.MEDIUM);
    } else if (hardCount > 0) {
      selectComplexity(ComplexityLevel.HARD);
    } else {
      // Если вопросов нет совсем, выводим уведомление и закрываем
      alert(t.allQuestionsFinished);
      closeLevelSelect();
    }
  };

  const renderButton = (level: ComplexityLevel, count: number, label: string, points: number, colorClass: string) => {
    const isEmpty = count === 0;
    
    return (
      <button 
        disabled={isEmpty}
        onClick={() => selectComplexity(level)}
        className={`w-full py-4 px-6 rounded-xl font-bold text-xl flex justify-between items-center transition-all ${
          isEmpty 
            ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed opacity-60 grayscale' 
            : `${colorClass} text-white shadow-md hover:scale-[1.02] active:scale-95`
        }`}
      >
        <span className="flex flex-col items-start text-left">
          <span>{label}</span>
          {!isEmpty && (
            <span className="text-[10px] opacity-70 uppercase tracking-widest">
              {t.remaining}{count}
            </span>
          )}
        </span>
        
        {isEmpty ? (
          <span className="text-[10px] italic font-black uppercase opacity-60 tracking-tighter">
            {t.levelFinished}
          </span>
        ) : (
          <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">+{points} {t.points}</span>
        )}
      </button>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <h2 className="text-3xl font-black text-blue-900 mb-6 text-center italic uppercase">
            {t.chooseLevel}
          </h2>
          
          <div className="space-y-4 mb-8">
            {renderButton(ComplexityLevel.EASY, easyCount, t.complexity.easy, SCORE_EASY, 'bg-emerald-500 hover:bg-emerald-600')}
            {renderButton(ComplexityLevel.MEDIUM, mediumCount, t.complexity.medium, SCORE_MEDIUM, 'bg-amber-500 hover:bg-amber-600')}
            {renderButton(ComplexityLevel.HARD, hardCount, t.complexity.hard, SCORE_HARD, 'bg-red-500 hover:bg-red-600')}
          </div>

          {hasAnyQuestions ? (
            <>
              <Timer 
                duration={settings.levelSelectTimer} 
                onTimeUp={handleAutoSelect} 
                isActive={true}
              />
              <p className="mt-4 text-center text-slate-500 text-sm">
                {t.timeoutHint}
              </p>
            </>
          ) : (
            <div className="text-center p-6 bg-red-50 rounded-2xl border-2 border-red-100">
              <div className="text-4xl mb-2">🚫</div>
              <p className="text-red-600 font-black uppercase text-sm leading-tight">
                {t.allQuestionsFinished}
              </p>
              <button 
                onClick={closeLevelSelect}
                className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors"
              >
                {t.back}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

