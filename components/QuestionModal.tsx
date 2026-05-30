'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { Timer } from './Timer';
import { TRANSLATIONS } from '../constants';
import { Confetti } from './Confetti';

export const QuestionModal: React.FC = () => {
  const { temp, settings, answerQuestion, locale } = useGameStore();
  const t = TRANSLATIONS[locale];
  const [inputValue, setInputValue] = useState('');
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

  if (!temp.showQuestionModal || !temp.currentQuestion) return null;

  const handleAnswerClick = (id: number) => {
    if (showResult) return;
    const isCorrect = id === temp.currentQuestion?.rightAnswerId;
    setShowResult(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      answerQuestion(isCorrect, temp.currentQuestion!.complexityLevel);
      setShowResult(null);
    }, 2500); // ÐÐµÐ¼Ð½Ð¾Ð³Ð¾ ÑƒÐ²ÐµÐ»Ð¸Ñ‡Ð¸Ð» Ð²Ñ€ÐµÐ¼Ñ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð½Ð°ÑÐ»Ð°Ð´Ð¸Ñ‚ÑŒÑÑ ÐºÐ¾Ð½Ñ„ÐµÑ‚Ñ‚Ð¸
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showResult || !inputValue.trim()) return;
    const isCorrect = inputValue.trim().toLowerCase() === temp.currentQuestion?.rightAnswerString?.toLowerCase();
    setShowResult(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      answerQuestion(isCorrect, temp.currentQuestion!.complexityLevel);
      setInputValue('');
      setShowResult(null);
    }, 2500);
  };

  const handleTimeUp = () => {
    if (showResult) return;
    setShowResult('wrong');
    setTimeout(() => {
      answerQuestion(false, temp.currentQuestion!.complexityLevel);
      setShowResult(null);
    }, 2000);
  };

  const getComplexityLabel = (level: string) => {
    return (t.complexity as any)[level];
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-hidden">
        {/* Confetti Explosion on Correct Answer */}
        {showResult === 'correct' && <Confetti />}

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full relative z-10"
        >
          {/* Header */}
          <div className="bg-blue-900 p-6 flex justify-between items-center text-white">
            <h3 className="text-xl font-bold opacity-80 uppercase tracking-widest">
              {locale === 'ru' ? 'Ð’Ð¾Ð¿Ñ€Ð¾Ñ' : 'Question'} ({getComplexityLabel(temp.currentQuestion.complexityLevel)})
            </h3>
            <div className="bg-amber-400 text-blue-900 px-4 py-1 rounded-full font-black">
              +{temp.currentQuestion.complexityLevel === 'easy' ? 3 : temp.currentQuestion.complexityLevel === 'medium' ? 6 : 10} {t.points}
            </div>
          </div>

          <div className="p-10">
            {showResult ? (
              <div className="text-center py-20">
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1.2, rotate: 0 }}
                  className={`text-6xl font-black mb-4 ${showResult === 'correct' ? 'text-emerald-500 drop-shadow-md' : 'text-red-500'}`}
                >
                  {showResult === 'correct' ? t.correct : t.wrong}
                </motion.div>
                {showResult === 'wrong' && (
                  <p className="text-xl text-slate-600">
                    {t.rightAnswer}: <span className="font-bold text-blue-900">
                      {temp.currentQuestion.answerType === 'ID' 
                        ? temp.currentQuestion.answersList?.find(a => a.id === temp.currentQuestion?.rightAnswerId)?.value 
                        : temp.currentQuestion.rightAnswerString}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black text-slate-800 mb-10 leading-tight">
                  {temp.currentQuestion.questionContent}
                </h2>

                {temp.currentQuestion.answerType === 'ID' && temp.currentQuestion.answersList ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {temp.currentQuestion.answersList.map((answer) => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswerClick(answer.id)}
                        className="py-6 px-8 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl text-xl font-bold transition-all text-left shadow-lg border-2 border-blue-700 active:scale-95"
                      >
                        {answer.value}
                      </button>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleTextSubmit} className="mb-10">
                    <input 
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={locale === 'ru' ? "Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð²Ð°Ñˆ Ð¾Ñ‚Ð²ÐµÑ‚ Ð·Ð´ÐµÑÑŒ..." : "Type your answer here..."}
                      className="w-full p-6 text-2xl border-4 border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all shadow-inner font-bold"
                    />
                    <button 
                      type="submit"
                      className="mt-4 w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-2xl font-black shadow-lg transition-transform active:scale-95"
                    >
                      {t.check}
                    </button>
                  </form>
                )}

                <Timer 
                  duration={settings.answerTimer}
                  onTimeUp={handleTimeUp}
                  isActive={true}
                  color="bg-red-500"
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

