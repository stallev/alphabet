'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { Question, ComplexityLevel } from '../types';
import { TRANSLATIONS } from '../constants';

export const QuestionEditor: React.FC = () => {
  const { 
    questions, 
    setEditorOpen, 
    closeAllModals,
    addQuestion, 
    updateQuestion, 
    deleteQuestion, 
    updateCurrentSuiteTitle,
    saveToLibrary,
    locale
  } = useGameStore();
  const t = TRANSLATIONS[locale];
  
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState(questions.currentSuite?.title || '');

  const [formData, setFormData] = useState<Partial<Question>>({
    complexityLevel: ComplexityLevel.EASY,
    answerType: 'ID',
    answersList: [],
    questionContent: '',
    rightAnswerId: 1,
    rightAnswerString: ''
  });

  const startEditing = (q: Question) => {
    setEditingId(q.id);
    setFormData(q);
  };

  const startNew = () => {
    setEditingId('new');
    setFormData({
      id: Date.now(),
      complexityLevel: ComplexityLevel.EASY,
      answerType: 'ID',
      answersList: [
        { id: 1, value: '' },
        { id: 2, value: '' },
        { id: 3, value: '' },
        { id: 4, value: '' }
      ],
      questionContent: '',
      rightAnswerId: 1,
      rightAnswerString: ''
    });
  };

  const handleSave = () => {
    if (!formData.questionContent) {
      alert("Пожалуйста, введите текст вопроса");
      return;
    }

    if (editingId === 'new') {
      addQuestion(formData as Question);
    } else if (typeof editingId === 'number') {
      updateQuestion(editingId, formData as Question);
    }
    setEditingId(null);
  };

  const handleConfirmDelete = () => {
    if (questionToDelete) {
      deleteQuestion(questionToDelete.id);
      setQuestionToDelete(null);
    }
  };

  const handleTitleSave = () => {
    updateCurrentSuiteTitle(tempTitle);
    setIsRenaming(false);
  };

  const handleSaveToLibrary = () => {
    if (questions.currentSuite) {
      const wasSaved = saveToLibrary(questions.currentSuite);
      if (wasSaved) {
        alert('Набор успешно сохранен в библиотеку!');
      } else {
        alert('Ошибка: Набор с таким названием уже существует в библиотеке.');
      }
    }
  };

  const handleDownloadJson = () => {
    if (!questions.currentSuite) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions.currentSuite, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${questions.currentSuite.title || 'questions'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleAnswerChange = (idx: number, value: string) => {
    const list = [...(formData.answersList || [])];
    list[idx] = { ...list[idx], value };
    setFormData({ ...formData, answersList: list });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100 flex flex-col overflow-hidden">
      {/* Top App Header */}
      <div className="bg-slate-900 text-white p-4 shadow-md shrink-0 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setEditorOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase transition-all"
            >
              {t.back}
            </button>
            <button 
              onClick={closeAllModals}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase transition-all"
            >
              {t.home}
            </button>
          </div>
          <h1 className="text-base md:text-xl font-black uppercase italic tracking-tighter">Редактор Набора</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center custom-scrollbar">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-5 md:p-8 mb-10">
          
          {/* Header with Title Editing */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-10 border-b pb-6 gap-6">
            <div className="flex-1 w-full">
              {isRenaming ? (
                <div className="flex gap-2 w-full">
                  <input 
                    autoFocus
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-xl md:text-2xl font-black text-blue-900 border-b-2 border-blue-600 outline-none w-full"
                  />
                  <button onClick={handleTitleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">ОК</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <h2 className="text-xl md:text-3xl font-black text-blue-900 italic break-words leading-tight">
                    {questions.currentSuite?.title}
                  </h2>
                  <button onClick={() => setIsRenaming(true)} className="text-slate-300 hover:text-blue-500 transition-colors p-1">✏️</button>
                </div>
              )}
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                Редактирование активного набора ({questions.currentSuite?.questionsList.length} вопр.)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
              <button 
                onClick={handleDownloadJson}
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-3 rounded-xl font-bold transition-all text-[10px] md:text-xs flex items-center justify-center gap-2"
                title="Скачать как JSON файл"
              >
                <span>📥</span> СКАЧАТЬ
              </button>
              <button 
                onClick={handleSaveToLibrary}
                className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-3 rounded-xl font-bold transition-all text-[10px] md:text-xs text-center"
              >
                💾 В БИБЛИОТЕКУ
              </button>
              <button 
                onClick={startNew}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md text-[10px] md:text-xs text-center"
              >
                + ДОБАВИТЬ
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {questions.currentSuite?.questionsList.map((q, index) => (
              <div key={q.id} className="p-4 md:p-5 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group gap-4">
                <div className="flex gap-3 md:gap-4 items-start flex-1 w-full">
                  <span className="text-xs font-black text-slate-300 min-w-[20px] mt-1 md:mt-0">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        q.complexityLevel === 'easy' ? 'bg-emerald-100 text-emerald-700' : 
                        q.complexityLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {q.complexityLevel}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">{q.answerType}</span>
                    </div>
                    <p className="font-bold text-slate-700 leading-snug text-sm md:text-base">{q.questionContent}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button 
                    onClick={() => startEditing(q)}
                    className="flex-1 md:flex-none bg-white border p-2 md:px-4 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm text-xs font-bold"
                  >
                    Изменить
                  </button>
                  <button 
                    onClick={() => setQuestionToDelete(q)}
                    className="bg-white border p-2 md:px-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm text-xs"
                    title="Удалить вопрос"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {(!questions.currentSuite?.questionsList.length) && (
               <div className="text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                 Вопросов пока нет. Добавьте первый или воспользуйтесь генератором!
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Question Modal */}
      <AnimatePresence>
        {editingId !== null && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-6 uppercase italic">
                {editingId === 'new' ? 'Новый вопрос' : 'Редактировать'}
              </h3>

              <div className="space-y-6">
                <section>
                  <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">Текст вопроса</label>
                  <textarea 
                    className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm md:text-base text-slate-900 placeholder:text-slate-400"
                    rows={3}
                    value={formData.questionContent}
                    onChange={e => setFormData({ ...formData, questionContent: e.target.value })}
                    placeholder="Введите вопрос..."
                  />
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <section>
                    <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">Сложность</label>
                    <select 
                      className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold appearance-none text-sm text-slate-900"
                      value={formData.complexityLevel}
                      onChange={e => setFormData({ ...formData, complexityLevel: e.target.value as ComplexityLevel })}
                    >
                      <option value={ComplexityLevel.EASY}>Легкий (Зеленый)</option>
                      <option value={ComplexityLevel.MEDIUM}>Средний (Оранжевый)</option>
                      <option value={ComplexityLevel.HARD}>Сложный (Красный)</option>
                    </select>
                  </section>
                  <section>
                    <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">Тип ответа</label>
                    <select 
                      className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold appearance-none text-sm text-slate-900"
                      value={formData.answerType}
                      onChange={e => setFormData({ ...formData, answerType: e.target.value as 'ID' | 'String' })}
                    >
                      <option value="ID">Тест (Варианты)</option>
                      <option value="String">Текстовый (Ввод)</option>
                    </select>
                  </section>
                </div>

                {formData.answerType === 'ID' ? (
                  <section>
                    <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">
                      Варианты ответа (отметьте правильный)
                    </label>
                    <div className="space-y-3">
                      {formData.answersList?.map((ans, idx) => (
                        <div 
                          key={idx} 
                          className={`flex gap-3 items-center p-2 rounded-xl transition-colors ${formData.rightAnswerId === ans.id ? 'bg-blue-50 border-blue-200 border' : 'border border-transparent'}`}
                        >
                          <input 
                            type="radio" 
                            name="correctAnswer" 
                            checked={formData.rightAnswerId === ans.id}
                            onChange={() => setFormData({ ...formData, rightAnswerId: ans.id })}
                            className="w-6 h-6 accent-blue-600 shrink-0 cursor-pointer"
                            title="Выбрать как правильный ответ"
                          />
                          <input 
                            className="flex-1 p-3 bg-white border-2 border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-300 transition-all"
                            placeholder={`Вариант ${idx + 1}`}
                            value={ans.value}
                            onChange={e => handleAnswerChange(idx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <section>
                    <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">Правильный ответ</label>
                    <input 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-900 placeholder:text-slate-400"
                      value={formData.rightAnswerString}
                      onChange={e => setFormData({ ...formData, rightAnswerString: e.target.value })}
                      placeholder="Например: Давид"
                    />
                  </section>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest text-xs md:text-sm"
                  >
                    СОХРАНИТЬ
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-4 md:py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black transition-all uppercase tracking-widest text-xs md:text-sm"
                  >
                    ОТМЕНА
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Individual Question Deletion */}
      <AnimatePresence>
        {questionToDelete && (
          <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-5xl mb-4 text-red-500">🗑️</div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase italic">Удалить вопрос?</h3>
              <p className="text-slate-500 mb-8 font-bold text-sm leading-relaxed">
                "{questionToDelete.questionContent}"
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase transition-all shadow-lg active:scale-95 text-xs"
                >
                  Да, удалить
                </button>
                <button 
                  onClick={() => setQuestionToDelete(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black uppercase transition-all active:scale-95 text-xs"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

