'use client';

import React, { useState, useRef } from 'react';
import { importSuiteAction } from '@/src/actions/admin/import-suite';
import { useRouter } from 'next/navigation';

type Tab = 'paste' | 'file';

export function SuiteImportForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('paste');
  const [jsonText, setJsonText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<
    | { type: 'success'; title: string; language: string; count: number }
    | { type: 'error'; message: string }
    | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!jsonText.trim()) {
      setResult({ type: 'error', message: 'Введите JSON или загрузите файл' });
      return;
    }

    setIsPending(true);
    setResult(null);

    try {
      const parsed = JSON.parse(jsonText);
      const res = await importSuiteAction(parsed);

      if (res.success) {
        setResult({
          type: 'success',
          title: res.data.title,
          language: res.data.language,
          count: res.data.questionsCount,
        });
        setJsonText('');
        router.refresh();
      } else {
        setResult({ type: 'error', message: res.error });
      }
    } catch {
      setResult({ type: 'error', message: 'Неверный формат JSON. Проверьте синтаксис.' });
    } finally {
      setIsPending(false);
    }
  }

  function handleFileLoad(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setResult({ type: 'error', message: 'Файл превышает 5 MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target?.result as string);
      setResult(null);
    };
    reader.readAsText(file);
  }

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['paste', 'file'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              tab === t
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t === 'paste' ? 'Вставить JSON' : 'Загрузить файл'}
          </button>
        ))}
      </div>

      {/* File input */}
      {tab === 'file' && (
        <div className="mb-4">
          <label className="block w-full border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-8 text-center cursor-pointer transition-all">
            <div className="text-slate-400 text-sm mb-2">
              Перетащите .json файл или нажмите для выбора
            </div>
            <div className="text-slate-600 text-xs">Максимум 5 MB</div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileLoad}
              className="hidden"
            />
          </label>
          {jsonText && (
            <p className="text-emerald-500 text-xs mt-2">
              ✓ Файл загружен ({(jsonText.length / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      )}

      {/* JSON textarea */}
      {tab === 'paste' && (
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={'{\n  "title": "Название набора",\n  "questionsList": [...]\n}'}
          rows={16}
          spellCheck={false}
          className="w-full bg-black/40 border border-slate-800 focus:border-emerald-500 p-4 rounded-xl text-slate-300 font-mono text-xs outline-none resize-none transition-colors"
        />
      )}

      {/* Result */}
      {result && (
        <div
          className={`mt-4 p-4 rounded-xl border text-sm ${
            result.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {result.type === 'success' ? (
            <>
              <span className="font-bold">✓ Импортировано успешно!</span>{' '}
              Набор <span className="font-bold">«{result.title}»</span> —{' '}
              {result.count} вопросов{' '}
              <span className="bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[11px] font-black uppercase">
                {result.language}
              </span>
            </>
          ) : (
            <>
              <span className="font-bold">✕ Ошибка:</span> {result.message}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleImport}
          disabled={isPending || !jsonText.trim()}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all"
        >
          {isPending ? 'Импорт...' : 'Импортировать набор'}
        </button>
        <button
          onClick={() => { setJsonText(''); setResult(null); }}
          className="px-5 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all text-sm"
        >
          Очистить
        </button>
      </div>
    </div>
  );
}
