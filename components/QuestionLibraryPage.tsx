'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { LibrarySuite, QuestionsSuite, Locale } from '../types';
import { TRANSLATIONS } from '../constants';

const LIBRARY_LABELS: Record<Locale, {
  title: string; subtitle: string; import: string; create: string;
  name: string; lang: string; status: string; count: string; type: string;
  actions: string; active: string; play: string; edit: string;
  deleteTitle: string; deleteConfirm: string; deleteBtn: string; cancel: string;
}> = {
  ru: { title: 'Библиотека наборов', subtitle: 'Управление контентом', import: 'ИМПОРТ', create: 'СОЗДАТЬ', name: 'Название набора', lang: 'Язык', status: 'Статус', count: 'Вопросов', type: 'Тип', actions: 'Действия', active: 'АКТИВЕН', play: 'В ИГРУ', edit: 'ИЗМЕНИТЬ', deleteTitle: 'Удалить набор?', deleteConfirm: 'Вы действительно хотите навсегда удалить пользовательский набор', deleteBtn: 'Удалить', cancel: 'Отмена' },
  en: { title: 'Suite Library', subtitle: 'Content Management', import: 'IMPORT', create: 'CREATE', name: 'Suite Name', lang: 'Lang', status: 'Status', count: 'Questions', type: 'Type', actions: 'Actions', active: 'ACTIVE', play: 'PLAY', edit: 'EDIT', deleteTitle: 'Delete Suite?', deleteConfirm: 'Are you sure you want to permanently delete user suite', deleteBtn: 'Delete', cancel: 'Cancel' },
  uk: { title: 'Бібліотека наборів', subtitle: 'Керування контентом', import: 'ІМПОРТ', create: 'СТВОРИТИ', name: 'Назва набору', lang: 'Мова', status: 'Статус', count: 'Питань', type: 'Тип', actions: 'Дії', active: 'АКТИВНИЙ', play: 'В ГРУ', edit: 'ЗМІНИТИ', deleteTitle: 'Видалити набір?', deleteConfirm: 'Ви дійсно хочете назавжди видалити користувацький набір', deleteBtn: 'Видалити', cancel: 'Скасувати' },
  de: { title: 'Set-Bibliothek', subtitle: 'Inhaltsverwaltung', import: 'IMPORTIEREN', create: 'ERSTELLEN', name: 'Set-Name', lang: 'Sprache', status: 'Status', count: 'Fragen', type: 'Typ', actions: 'Aktionen', active: 'AKTIV', play: 'SPIELEN', edit: 'BEARBEITEN', deleteTitle: 'Set löschen?', deleteConfirm: 'Möchten Sie das Benutzer-Set wirklich dauerhaft löschen', deleteBtn: 'Löschen', cancel: 'Abbrechen' },
  ro: { title: 'Biblioteca de seturi', subtitle: 'Gestionare conținut', import: 'IMPORTĂ', create: 'CREEAZĂ', name: 'Nume set', lang: 'Limbă', status: 'Status', count: 'Întrebări', type: 'Tip', actions: 'Acțiuni', active: 'ACTIV', play: 'JOACĂ', edit: 'EDITEAZĂ', deleteTitle: 'Șterge setul?', deleteConfirm: 'Sigur doriți să ștergeți definitiv setul utilizatorului', deleteBtn: 'Șterge', cancel: 'Anulează' },
};

export const QuestionLibraryPage: React.FC = () => {
  const { 
    library, 
    systemSuites,
    deleteFromLibrary, 
    loadCustomQuestions, 
    saveToLibrary,
    setLibraryOpen, 
    setEditorOpen,
    closeAllModals,
    questions,
    locale 
  } = useGameStore();
  
  const [suiteToDelete, setSuiteToDelete] = useState<LibrarySuite | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[locale];

  const handleEdit = (suite: QuestionsSuite | LibrarySuite) => {
    loadCustomQuestions(suite);
    setLibraryOpen(false);
    setEditorOpen(true);
  };

  const handleActivate = (suite: QuestionsSuite | LibrarySuite) => {
    loadCustomQuestions(suite);
    setLibraryOpen(false);
  };

  const handleCreateNew = () => {
    const newSuite: QuestionsSuite = {
      title: t.newSuite,
      language: locale,
      questionsList: []
    };
    loadCustomQuestions(newSuite); // Set as current
    setLibraryOpen(false);         // Close library
    setEditorOpen(true);           // Open editor directly
  };

  const handleDownload = (suite: QuestionsSuite | LibrarySuite) => {
    const exportData = {
      title: suite.title,
      language: suite.language,
      questionsList: suite.questionsList
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${suite.title || 'alphabet-set'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.questionsList && Array.isArray(json.questionsList)) {
          loadCustomQuestions(json);
          saveToLibrary(json);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setLibraryOpen(false);
        } else {
          alert(t.invalidJson);
        }
      } catch (err) {
        alert(t.fileReadError);
      }
    };
    reader.readAsText(file);
  };

  const confirmDelete = () => {
    if (suiteToDelete) {
      deleteFromLibrary(suiteToDelete.id);
      setSuiteToDelete(null);
    }
  };

  const getLangBadge = (code?: string) => {
    const label = code?.toUpperCase() || 'RU';
    return (
      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-black text-[10px] border border-slate-200 shadow-sm">
        {label}
      </span>
    );
  };

  const currentActiveTitle = questions.currentSuite?.title;

  // ФИЛЬТРАЦИЯ ПО ЛОКАЛИ
  const filteredSystem = systemSuites.filter(s => s.language === locale);
  const filteredUser = library.filter(s => s.language === locale);

  const labels = LIBRARY_LABELS[locale];

  // Helper for mobile cards
  const renderMobileCard = (suite: QuestionsSuite | LibrarySuite, isSystem: boolean) => {
    const isActive = suite.title === currentActiveTitle;
    const isLibrarySuite = !isSystem && 'id' in suite;
    
    return (
      <div key={isLibrarySuite ? (suite as LibrarySuite).id : suite.title} className={`p-5 rounded-2xl border-2 transition-all ${isActive ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-2">
            <h4 className={`font-black text-lg leading-tight mb-1 ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{suite.title}</h4>
            <div className="flex gap-2 items-center">
              {getLangBadge(suite.language)}
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{suite.questionsList.length} Q</span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{isSystem ? 'SYSTEM' : 'USER'}</span>
            </div>
          </div>
          <button 
            onClick={() => handleActivate(suite)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              isActive 
                ? 'bg-emerald-500 text-white cursor-default ring-2 ring-emerald-100' 
                : 'bg-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white'
            }`}
          >
            {isActive ? labels.active : labels.play}
          </button>
        </div>
        
        <div className="flex gap-2 border-t border-slate-100 pt-3">
          <button 
            onClick={() => handleDownload(suite)} 
            className="flex-1 bg-slate-50 hover:bg-slate-100 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-100"
          >
            💾 JSON
          </button>
          <button 
            onClick={() => handleEdit(suite)} 
            className="flex-1 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl text-xs font-bold text-blue-600 border border-blue-100"
          >
            ✏️ {labels.edit}
          </button>
          {isLibrarySuite ? (
            <button 
              onClick={() => setSuiteToDelete(suite as LibrarySuite)} 
              className="px-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 border border-red-100"
            >
              🗑️
            </button>
          ) : (
            <div className="px-3 bg-slate-50 rounded-xl flex items-center justify-center opacity-30 grayscale cursor-not-allowed">🗑️</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shadow-xl shrink-0 sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex gap-2">
              <button 
                onClick={() => setLibraryOpen(false)} 
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
            <div className="border-l border-white/20 pl-4">
              <h1 className="text-lg md:text-xl font-black uppercase italic tracking-tighter leading-none">{labels.title}</h1>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest hidden sm:block">{labels.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleCreateNew}
              className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>✨</span> <span>{labels.create}</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>📥</span> <span>{labels.import}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">
                  <th className="px-10 py-6">{labels.name}</th>
                  <th className="px-6 py-6 text-center">{labels.lang}</th>
                  <th className="px-6 py-6 text-center">{labels.status}</th>
                  <th className="px-6 py-6 text-center">{labels.count}</th>
                  <th className="px-6 py-6 text-center">{labels.type}</th>
                  <th className="px-10 py-6 text-right">{labels.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSystem.map((suite, idx) => {
                  const isActive = suite.title === currentActiveTitle;
                  return (
                    <tr key={`sys-${idx}`} className={`transition-all group ${isActive ? 'bg-blue-50/30' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-10 py-8 max-w-md">
                        <div className={`font-black text-lg leading-tight transition-colors ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>
                          {suite.title}
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center uppercase font-bold text-slate-400">
                        {getLangBadge(suite.language)}
                      </td>
                      <td className="px-6 py-8 text-center">
                        <button 
                          onClick={() => handleActivate(suite)}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                            isActive 
                              ? 'bg-emerald-500 text-white cursor-default ring-4 ring-emerald-100' 
                              : 'bg-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {isActive ? labels.active : labels.play}
                        </button>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className="inline-block bg-slate-100 text-slate-500 px-4 py-1.5 rounded-xl font-black text-xs min-w-[50px]">
                          {suite.questionsList.length}
                        </span>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest">SYSTEM</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex justify-end gap-3 items-center">
                          <button onClick={() => handleDownload(suite)} className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-100" title="Скачать">💾</button>
                          <button onClick={() => handleEdit(suite)} className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">{labels.edit}</button>
                          <div className="w-10 h-10 flex items-center justify-center opacity-20 grayscale cursor-not-allowed">🗑️</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUser.map((suite) => {
                  const isActive = suite.title === currentActiveTitle;
                  return (
                    <motion.tr 
                      key={suite.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-all group ${isActive ? 'bg-blue-50/30' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="px-10 py-8 max-w-md">
                        <div className={`font-black text-lg leading-tight transition-colors ${isActive ? 'text-blue-600' : 'text-blue-700'}`}>
                          {suite.title}
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                        {getLangBadge(suite.language)}
                      </td>
                      <td className="px-6 py-8 text-center">
                        <button 
                          onClick={() => handleActivate(suite)}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                            isActive 
                              ? 'bg-emerald-500 text-white cursor-default ring-4 ring-emerald-100' 
                              : 'bg-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {isActive ? labels.active : labels.play}
                        </button>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className="inline-block bg-slate-100 text-slate-500 px-4 py-1.5 rounded-xl font-black text-xs min-w-[50px]">
                          {suite.questionsList.length}
                        </span>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">USER</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex justify-end gap-3 items-center">
                          <button onClick={() => handleDownload(suite)} className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-100">💾</button>
                          <button onClick={() => handleEdit(suite)} className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">{labels.edit}</button>
                          <button onClick={() => setSuiteToDelete(suite)} className="p-3 text-slate-300 hover:text-red-500 transition-all">🗑️</button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4">
            {filteredSystem.map(suite => renderMobileCard(suite, true))}
            {filteredUser.map(suite => renderMobileCard(suite, false))}
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <AnimatePresence>
        {suiteToDelete && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full text-center">
              <div className="text-6xl mb-6">🗑️</div>
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase italic">{labels.deleteTitle}</h3>
              <p className="text-slate-500 mb-8 text-sm font-medium">{labels.deleteConfirm} <br/><span className="text-slate-800 font-black">"{suiteToDelete.title}"</span>?</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase text-xs transition-all shadow-lg active:scale-95">{labels.deleteBtn}</button>
                <button onClick={() => setSuiteToDelete(null)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs transition-all active:scale-95">{labels.cancel}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

