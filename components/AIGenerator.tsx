'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import { useGameStore } from '../store';
import { QuestionsSuite, ComplexityLevel, Question } from '../types';
import { TRANSLATIONS } from '../constants';

const AUDIENCE_LEVELS = [
  { level: 1, label: 'Новичок', desc: 'Знает только самые известные сюжеты' },
  { level: 2, label: 'Интересующийся', desc: 'Читал Евангелия, знает основы' },
  { level: 3, label: 'Постоянный слушатель', desc: 'Знаком с основными доктринами' },
  { level: 4, label: 'Член церкви', desc: 'Хорошо знает контекст большинства книг' },
  { level: 5, label: 'Лидер служения', desc: 'Глубоко изучает Писание' },
  { level: 6, label: 'Проповедник / Учитель', desc: 'Знает нюансы и исторический контекст' },
  { level: 7, label: 'Магистр богословия', desc: 'Академический уровень знаний' },
];

const LANGUAGES = [
  { code: 'ru', label: 'Русский', locale: 'RU', translation: 'Синодальный перевод' },
  { code: 'en', label: 'English', locale: 'EN', translation: 'ESV / NIV' },
  { code: 'uk', label: 'Українська', locale: 'UK', translation: 'Переклад Огієнка' },
  { code: 'de', label: 'Deutsch', locale: 'DE', translation: 'Luther 2017 / Elberfelder' },
  { code: 'ro', label: 'Română', locale: 'RO', translation: 'Cornilescu' },
];

const OR_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ?? '';

const FALLBACK_CHAIN = [
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-chat:free'
];

export const AIGenerator: React.FC = () => {
  const { setAIGeneratorOpen, closeAllModals, saveToLibrary, loadCustomQuestions, aiConfig, locale } = useGameStore();
  const t = TRANSLATIONS[locale];
  
  const [topic, setTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(4);
  const [selectedLang, setSelectedLang] = useState('ru');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [generatedSuite, setGeneratedSuite] = useState<QuestionsSuite | null>(null);
  
  const [captchaChallenge, setCaptchaChallenge] = useState({ a: 0, b: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    generateCaptcha();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const generateCaptcha = () => {
    setCaptchaChallenge({
      a: Math.floor(Math.random() * 20) + 1,
      b: Math.floor(Math.random() * 20) + 1
    });
    setCaptchaInput('');
  };

  const cleanJsonResponse = (text: string) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return match[0];
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  };

  const callOpenRouter = async (modelId: string, prompt: string, signal: AbortSignal): Promise<string> => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: signal,
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Alphabet Bible Game"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "API Error");
    return result.choices[0].message.content;
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isCancelledRef.current = true;
    setIsGenerating(false);
    setGenerationStatus('Генерация отменена пользователем');
    setTimeout(() => setGenerationStatus(''), 2000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (parseInt(captchaInput) !== captchaChallenge.a + captchaChallenge.b) {
      alert("Решите капчу правильно!");
      generateCaptcha();
      return;
    }

    setIsGenerating(true);
    isCancelledRef.current = false;
    setGenerationStatus('Подготовка контента...');
    
    abortControllerRef.current = new AbortController();

    const langInfo = LANGUAGES.find(l => l.code === selectedLang);
    const translationInstruction = selectedLang === 'ru' 
      ? 'Используй Синодальный перевод как основной источник.'
      : `Используй наиболее авторитетный и современный перевод Библии для языка ${langInfo?.label} (например, ${langInfo?.translation}).`;

    const prompt = `Действуй как эксперт-методист библейских викторин для продвинутых христиан. Генерируй контент на языке: ${langInfo?.label.toUpperCase()}.
    ТЕМАТИКА: ${topic}
    Уровень аудитории: "Advanced/Knowledgeable Christians" (Сложный).

    СТРОГИЕ ТРЕБОВАНИЯ:
    1. ЯЗЫК: Все вопросы и ответы должны быть СТРОГО на языке ${langInfo?.label}.
    2. КОЛИЧЕСТВО: Генерируй ровно 150 УНИКАЛЬНЫХ вопросов.
    3. РАСПРЕДЕЛЕНИЕ: Строго поровну: 50 easy, 50 medium, 50 hard.
    4. ИСТОЧНИК: ${translationInstruction}
    5. ФОКУС: Факты, события, имена, география.
    6. ЗАПРЕТ: НЕ используй вопросы о греческом/еврейском значении слов.
    7. ТИПЫ ОТВЕТОВ: 100% - тесты (ID) с 4 вариантами ответа.
    8. ЧИСТОТА: Текст вопроса (questionContent) НИКОГДА не должен содержать правильный ответ или подсказку (например, в скобках). 
       Плохо: "В какой стране была написана 'Тихая ночь' (Австрия)?"
       Хорошо: "В какой стране была написана 'Тихая ночь'?"
    
    ВАЖНО: Вопросы должны быть СЛОЖНЫМИ:
    - 'easy': Не очевидные факты, требует хорошего знания текста Библии. Не спрашивать "Кто построил ковчег?" или "Где родился Иисус?". Спрашивать детали, имена, локации.
    - 'medium': Требует знания хронологии, богословских связей, второстепенных персонажей.
    - 'hard': Очень сложные вопросы для "Advanced/Knowledgeable Christians". Редкие имена, точные цифры, специфические географические детали, ветхозаветные прообразы.

    РАНДОМИЗАЦИЯ: Обеспечь случайное положение правильного ответа в массиве answersList. Правильный ответ НЕ должен быть всегда на одной позиции. ID правильного ответа в поле rightAnswerId должен соответствовать ID правильного варианта в списке.

    JSON ФОРМАТ:
    {
      "title": "${topic}",
      "language": "${selectedLang}",
      "questionsList": [
        {
          "id": 1...150,
          "questionContent": "текст вопроса на языке ${selectedLang} (БЕЗ ОТВЕТА ВНУТРИ)",
          "complexityLevel": "easy"|"medium"|"hard",
          "answerType": "ID",
          "answersList": [
            {"id":1,"value":"вариант A"},
            {"id":2,"value":"вариант B"},
            {"id":3,"value":"вариант C"},
            {"id":4,"value":"вариант D"}
          ],
          "rightAnswerId": (1, 2, 3 или 4 - случайным образом)
        }
      ]
    }`;

    try {
      let jsonText = '';
      if (aiConfig.provider === 'openrouter') {
        const models = [aiConfig.model, ...FALLBACK_CHAIN.filter(m => m !== aiConfig.model)];
        for (let i = 0; i < models.length; i++) {
          try {
            if (isCancelledRef.current) return;
            setGenerationStatus(`Генерация через ${models[i].split('/').pop()}...`);
            jsonText = await callOpenRouter(models[i], prompt, abortControllerRef.current.signal);
            if (jsonText) break;
          } catch (e: any) { 
            if (e.name === 'AbortError') throw e;
            if (i === models.length - 1) throw e; 
          }
        }
      } else {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: aiConfig.model,
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        if (isCancelledRef.current) return;
        jsonText = response.text || '';
      }

      if (isCancelledRef.current) return;
      const data = JSON.parse(cleanJsonResponse(jsonText));
      data.language = selectedLang;
      setGeneratedSuite(data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted');
      } else {
        alert(`Ошибка: ${err.message}`);
        generateCaptcha();
      }
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const getComplexityStyles = (level: string) => {
    switch(level) {
      case 'easy': return 'border-emerald-500';
      case 'medium': return 'border-amber-500';
      case 'hard': return 'border-red-500';
      default: return 'border-slate-300';
    }
  };

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
            <h2 className="text-xl font-black uppercase italic tracking-tighter ml-4">ИИ Генератор</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar">
        <div className="max-w-4xl w-full space-y-8 pb-10">
          {!generatedSuite ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Тема (на выбранном языке)</label>
                    <input type="text" value={topic} disabled={isGenerating} onChange={(e) => setTopic(e.target.value)} placeholder="Напр: Деяния Апостолов" className="w-full p-4 text-lg border-2 border-slate-100 focus:border-blue-500 rounded-xl outline-none font-bold disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Язык вопросов</label>
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
                  <label className="block text-xs font-black text-slate-400 uppercase mb-4">Уровень сложности аудитории</label>
                  <div className="grid grid-cols-1 gap-2">
                    {AUDIENCE_LEVELS.slice(3).map((al) => (
                      <button key={al.level} disabled={isGenerating} onClick={() => setSelectedLevel(al.level)} className={`p-4 rounded-xl text-left border-2 transition-all flex justify-between items-center ${selectedLevel === al.level ? 'border-blue-600 bg-blue-50' : 'bg-white border-slate-100 hover:border-blue-200'} disabled:opacity-50`}>
                        <div><span className="font-black text-blue-900 block">{al.label}</span><span className="text-xs text-slate-500">{al.desc}</span></div>
                      </button>
                    ))}
                  </div>
                </div>

                {!isGenerating && (
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 flex items-center gap-4">
                    <div className="bg-white px-6 py-4 rounded-xl font-black text-2xl border-2 border-slate-100 text-blue-900">{captchaChallenge.a} + {captchaChallenge.b} = ?</div>
                    <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Ответ..." className="flex-1 p-4 text-2xl border-2 border-slate-200 focus:border-blue-600 rounded-xl outline-none font-black" />
                  </div>
                )}

                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 justify-center text-blue-600 font-black animate-pulse uppercase tracking-widest italic">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                      {generationStatus || 'ГЕНЕРАЦИЯ...'}
                    </div>
                    <button 
                      onClick={handleStopGeneration}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-600 py-6 rounded-2xl text-xl font-black shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <span>⏹</span> ОСТАНОВИТЬ ГЕНЕРАЦИЮ
                    </button>
                  </div>
                ) : (
                  <button onClick={handleGenerate} disabled={!topic.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-6 rounded-2xl text-xl font-black shadow-lg transition-all uppercase tracking-widest">
                    ГЕНЕРИРОВАТЬ 150 ВОПРОСОВ ({selectedLang.toUpperCase()})
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
                  </h3>
                  <p className="text-xs font-black text-slate-400 uppercase">Сгенерировано: {generatedSuite.questionsList.length} вопросов</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setGeneratedSuite(null)} className="text-slate-400 font-bold px-4">Назад</button>
                  <button onClick={() => { loadCustomQuestions(generatedSuite); saveToLibrary(generatedSuite); setAIGeneratorOpen(false); }} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest">В ИГРУ</button>
                </div>
              </div>
              <div className="grid gap-4">
                {generatedSuite.questionsList.map((q) => (
                  <div key={q.id} className={`p-6 rounded-3xl border-[3px] flex justify-between items-start gap-6 bg-white shadow-sm transition-all ${getComplexityStyles(q.complexityLevel)}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm border ${
                          q.complexityLevel === 'easy' ? 'border-emerald-500 text-emerald-600' : 
                          q.complexityLevel === 'medium' ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'
                        }`}>{q.complexityLevel}</span>
                        <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded border border-blue-500/20">{q.answerType}</span>
                      </div>
                      <p className="font-bold text-lg leading-snug text-slate-800">{q.questionContent}</p>
                      <p className="mt-3 text-xs font-black opacity-60 uppercase italic">
                        Правильный: {q.answerType === 'ID' ? q.answersList?.find(a => a.id === q.rightAnswerId)?.value : q.rightAnswerString}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingQuestion(q)} className="p-3 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all">✏️</button>
                      <button onClick={() => setGeneratedSuite({...generatedSuite, questionsList: generatedSuite.questionsList.filter(x => x.id !== q.id)})} className="p-3 bg-slate-100 hover:bg-red-500 hover:text-white rounded-xl transition-all">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

