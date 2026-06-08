'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useGameStore } from '../store';
import { QuestionsSuite, Question } from '../types';
import { TRANSLATIONS } from '../constants';
import { getDemoSuite } from '@/lib/demo-questions';
import { CreditsGateOverlay } from './CreditsGateOverlay';

const AUDIENCE_LEVELS = [
  { level: 4, label: 'Член церкви',           labelEn: 'Church Member',       desc: 'Хорошо знает контекст большинства книг',         descEn: 'Good knowledge of most Bible books' },
  { level: 5, label: 'Лидер служения',         labelEn: 'Ministry Leader',     desc: 'Глубоко изучает Писание',                         descEn: 'Deeply studies Scripture' },
  { level: 6, label: 'Проповедник / Учитель',  labelEn: 'Preacher / Teacher',  desc: 'Знает нюансы и исторический контекст',            descEn: 'Knows nuances and historical context' },
  { level: 7, label: 'Магистр богословия',     labelEn: 'Theology Graduate',   desc: 'Академический уровень знаний',                    descEn: 'Academic level of knowledge' },
];

const LANGUAGES = [
  { code: 'ru', label: 'Русский',    locale: 'RU', translation: 'Синодальный перевод' },
  { code: 'en', label: 'English',    locale: 'EN', translation: 'ESV / NIV' },
  { code: 'uk', label: 'Українська', locale: 'UK', translation: 'Переклад Огієнка' },
  { code: 'de', label: 'Deutsch',    locale: 'DE', translation: 'Luther 2017 / Elberfelder' },
  { code: 'ro', label: 'Română',     locale: 'RO', translation: 'Cornilescu' },
];

const DEMO_FAKE_STATUSES_RU = [
  'Подготовка контента...',
  'Подключение к AI...',
  'Генерация вопросов...',
  'Обработка ответов...',
  'Финальная проверка...',
];
const DEMO_FAKE_STATUSES_EN = [
  'Preparing content...',
  'Connecting to AI...',
  'Generating questions...',
  'Processing answers...',
  'Final validation...',
];

export const AIGenerator: React.FC = () => {
  const { setAIGeneratorOpen, closeAllModals, saveToLibrary, loadCustomQuestions, locale } = useGameStore();
  const t = TRANSLATIONS[locale];
  const { data: session } = useSession();

  const isDemoMode = session?.user?.role !== 'admin';
  const isEn = locale === 'en';

  const [topic, setTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(4);
  const [selectedLang, setSelectedLang] = useState(locale === 'en' ? 'en' : 'ru');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [generatedSuite, setGeneratedSuite] = useState<QuestionsSuite | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, []);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    setIsGenerating(false);
    setGenerationStatus(isEn ? 'Generation cancelled' : 'Генерация отменена пользователем');
    setTimeout(() => setGenerationStatus(''), 2000);
  };

  const runDemoGeneration = async () => {
    const fakeStatuses = isEn ? DEMO_FAKE_STATUSES_EN : DEMO_FAKE_STATUSES_RU;
    setIsGenerating(true);

    for (let i = 0; i < fakeStatuses.length; i++) {
      setGenerationStatus(fakeStatuses[i]);
      await new Promise((res) => setTimeout(res, 550));
    }

    const demoSuite = getDemoSuite(selectedLang);
    const titled = { ...demoSuite, title: topic.trim() || demoSuite.title };
    setGeneratedSuite(titled);
    setIsGenerating(false);
    setGenerationStatus('');
  };

  const runRealGeneration = async () => {
    setIsGenerating(true);
    setGenerationStatus(isEn ? 'Preparing content...' : 'Подготовка контента...');
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({ topic: topic.trim(), lang: selectedLang }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? `Server error ${response.status}`);
      }

      const data = await response.json();
      setGeneratedSuite(data.suite);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      alert(`${isEn ? 'Error' : 'Ошибка'}: ${message}`);
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;
    if (isDemoMode) {
      runDemoGeneration();
    } else {
      runRealGeneration();
    }
  };

  const getComplexityStyles = (level: string) => {
    switch (level) {
      case 'easy':   return 'border-emerald-500';
      case 'medium': return 'border-amber-500';
      case 'hard':   return 'border-red-500';
      default:       return 'border-slate-300';
    }
  };

  const topicPlaceholder = isEn ? 'e.g. Acts of the Apostles' : 'Напр: Деяния Апостолов';
  const topicLabel       = isEn ? 'Topic (in selected language)' : 'Тема (на выбранном языке)';
  const langLabel        = isEn ? 'Question language' : 'Язык вопросов';
  const levelLabel       = isEn ? 'Audience difficulty level' : 'Уровень сложности аудитории';
  const generateBtn      = isEn
    ? `GENERATE 150 QUESTIONS (${selectedLang.toUpperCase()})`
    : `ГЕНЕРИРОВАТЬ 150 ВОПРОСОВ (${selectedLang.toUpperCase()})`;
  const stopBtn          = isEn ? 'STOP GENERATION' : 'ОСТАНОВИТЬ ГЕНЕРАЦИЮ';
  const generatedCount   = isEn ? 'Generated:' : 'Сгенерировано:';
  const questions        = isEn ? 'questions' : 'вопросов';
  const backBtn          = isEn ? 'Back' : 'Назад';
  const playBtn          = isEn ? 'PLAY' : 'В ИГРУ';
  const correctLabel     = isEn ? 'Correct:' : 'Правильный:';
  const headerTitle      = isEn ? 'AI Generator' : 'ИИ Генератор';

  const DEMO_VISIBLE_COUNT = 3;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col overflow-hidden">
      <div className="bg-slate-900 text-white p-4 shadow-md shrink-0 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (isGenerating) handleStopGeneration();
                  setAIGeneratorOpen(false);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
              >
                {t.back}
              </button>
              <button 
                onClick={() => {
                  if (isGenerating) handleStopGeneration();
                  closeAllModals();
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
              >
                {t.home}
              </button>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">{headerTitle}</h2>
              {isDemoMode && (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  DEMO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo mode info banner */}
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 shrink-0">
          <div className="container mx-auto flex items-center gap-3 max-w-4xl">
            <span className="text-amber-500 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </span>
            <p className="text-amber-800 text-xs font-bold leading-relaxed">
              {isEn
                ? 'Demo Mode — explore the interface and see sample output. Full generation (150 questions) requires AI Credits. Coming soon for authorized users.'
                : 'Demo Mode — исследуйте интерфейс и посмотрите пример результата. Полная генерация (150 вопросов) требует кредитов. Скоро для авторизованных пользователей.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar">
        <div className="max-w-4xl w-full space-y-8 pb-10">
          {!generatedSuite ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">{topicLabel}</label>
                    <input
                      type="text"
                      value={topic}
                      disabled={isGenerating}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder={topicPlaceholder}
                      className="w-full p-4 text-lg border-2 border-slate-100 focus:border-blue-500 rounded-xl outline-none font-bold disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">{langLabel}</label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map(l => (
                        <button 
                          key={l.code} 
                          disabled={isGenerating}
                          onClick={() => setSelectedLang(l.code)}
                          className={`px-4 py-2 rounded-xl font-bold border-2 transition-all flex items-center gap-2 ${selectedLang === l.code ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'} disabled:opacity-50`}
                        >
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{l.locale}</span>
                          <span>{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-4">{levelLabel}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {AUDIENCE_LEVELS.map((al) => (
                      <button
                        key={al.level}
                        disabled={isGenerating}
                        onClick={() => setSelectedLevel(al.level)}
                        className={`p-4 rounded-xl text-left border-2 transition-all flex justify-between items-center ${selectedLevel === al.level ? 'border-blue-600 bg-blue-50' : 'bg-white border-slate-100 hover:border-blue-200'} disabled:opacity-50`}
                      >
                        <div>
                          <span className="font-black text-blue-900 block">{isEn ? al.labelEn : al.label}</span>
                          <span className="text-xs text-slate-500">{isEn ? al.descEn : al.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 justify-center text-blue-600 font-black animate-pulse uppercase tracking-widest italic">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                      {generationStatus || (isEn ? 'GENERATING...' : 'ГЕНЕРАЦИЯ...')}
                    </div>
                    <button 
                      onClick={handleStopGeneration}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-600 py-6 rounded-2xl text-xl font-black shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <span>⏹</span> {stopBtn}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!topic.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-6 rounded-2xl text-xl font-black shadow-lg transition-all uppercase tracking-widest"
                  >
                    {generateBtn}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border-2 border-emerald-100 p-8 rounded-3xl flex justify-between items-center shadow-lg sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">
                      {LANGUAGES.find(l => l.code === generatedSuite.language)?.locale}
                    </span>
                    {generatedSuite.title}
                    {isDemoMode && (
                      <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-xs font-black uppercase">DEMO</span>
                    )}
                  </h3>
                  <p className="text-xs font-black text-slate-400 uppercase">
                    {generatedCount} {generatedSuite.questionsList.length} {questions}
                    {isDemoMode && ` · ${isEn ? 'Full suite: 150 questions (locked)' : 'Полный набор: 150 вопросов (заблокировано)'}`}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setGeneratedSuite(null)} className="text-slate-400 font-bold px-4">{backBtn}</button>
                  {!isDemoMode && (
                    <button
                      onClick={() => {
                        loadCustomQuestions(generatedSuite);
                        saveToLibrary(generatedSuite);
                        setAIGeneratorOpen(false);
                      }}
                      className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest"
                    >
                      {playBtn}
                    </button>
                  )}
                </div>
              </div>

              {/* Visible questions */}
              <div className="grid gap-4">
                {generatedSuite.questionsList
                  .slice(0, isDemoMode ? DEMO_VISIBLE_COUNT : undefined)
                  .map((q) => (
                    <div
                      key={q.id}
                      className={`p-6 rounded-3xl border-[3px] flex justify-between items-start gap-6 bg-white shadow-sm transition-all ${getComplexityStyles(q.complexityLevel)}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm border ${
                            q.complexityLevel === 'easy'   ? 'border-emerald-500 text-emerald-600' :
                            q.complexityLevel === 'medium' ? 'border-amber-500 text-amber-600'     : 'border-red-500 text-red-600'
                          }`}>{q.complexityLevel}</span>
                          <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded border border-blue-500/20">{q.answerType}</span>
                        </div>
                        <p className="font-bold text-lg leading-snug text-slate-800">{q.questionContent}</p>
                        <p className="mt-3 text-xs font-black opacity-60 uppercase italic">
                          {correctLabel} {q.answerType === 'ID' ? q.answersList?.find(a => a.id === q.rightAnswerId)?.value : q.rightAnswerString}
                        </p>
                      </div>
                      {!isDemoMode && (
                        <div className="flex gap-2">
                          <button onClick={() => setEditingQuestion(q)} className="p-3 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all">✏️</button>
                          <button
                            onClick={() => setGeneratedSuite({
                              ...generatedSuite,
                              questionsList: generatedSuite.questionsList.filter(x => x.id !== q.id)
                            })}
                            className="p-3 bg-slate-100 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Credits gate overlay — only in demo mode */}
              {isDemoMode && (
                <CreditsGateOverlay
                  lockedCount={150 - DEMO_VISIBLE_COUNT}
                  locale={locale}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
