'use client';

import React, { useState, useMemo } from 'react';
import type { QuestionSuite } from '@/generated/client';
import { deleteSuiteAction } from '@/src/actions/admin/delete-suite';
import { useRouter } from 'next/navigation';

const SOURCE_LABELS: Record<string, string> = {
  json: 'JSON',
  manual: 'Вручную',
  ai: 'AI',
  system: 'Система',
};

const LANG_FLAGS: Record<string, string> = {
  ru: '🇷🇺',
  en: '🇬🇧',
  uk: '🇺🇦',
  de: '🇩🇪',
  ro: '🇷🇴',
};

type SortDir = 'asc' | 'desc' | null;

interface SuitesTableProps {
  suites: QuestionSuite[];
}

export function SuitesTable({ suites }: SuitesTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [langFilter, setLangFilter] = useState<string>('all');
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const languages = useMemo(
    () => ['all', ...Array.from(new Set(suites.map((s) => s.language))).sort()],
    [suites],
  );

  const displayed = useMemo(() => {
    let result = langFilter === 'all' ? suites : suites.filter((s) => s.language === langFilter);
    if (sortDir) {
      result = [...result].sort((a, b) =>
        sortDir === 'asc'
          ? a.title.localeCompare(b.title, 'ru')
          : b.title.localeCompare(a.title, 'ru'),
      );
    }
    return result;
  }, [suites, langFilter, sortDir]);

  function toggleSort() {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Удалить набор «${title}»? Все вопросы будут удалены.`)) return;

    setDeletingId(id);
    const result = await deleteSuiteAction(id);
    setDeletingId(null);

    if (result.success) {
      router.refresh();
    } else {
      alert(`Ошибка: ${result.error}`);
    }
  }

  if (suites.length === 0) {
    return (
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-12 text-center">
        <div className="text-slate-600 text-sm">Наборы вопросов не найдены</div>
        <a
          href="/admin/suites/import"
          className="inline-block mt-4 text-emerald-500 text-sm hover:underline"
        >
          Импортировать первый набор →
        </a>
      </div>
    );
  }

  const sortIcon = sortDir === 'asc' ? ' ↑' : sortDir === 'desc' ? ' ↓' : ' ↕';

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLangFilter(lang)}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-colors ${
              langFilter === lang
                ? 'bg-emerald-500 text-black'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {lang === 'all' ? 'Все языки' : `${LANG_FLAGS[lang] ?? ''} ${lang}`}
          </button>
        ))}
        <span className="ml-auto text-slate-600 text-xs">
          {displayed.length} из {suites.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3 text-left text-slate-600 text-[10px] uppercase tracking-widest font-bold">
                <button
                  onClick={toggleSort}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                  title="Сортировать по названию"
                >
                  Название
                  <span className="text-slate-500">{sortIcon}</span>
                </button>
              </th>
              {['Язык', 'Источник', 'Создан', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-slate-600 text-[10px] uppercase tracking-widest font-bold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-600 text-sm">
                  Нет наборов для выбранного языка
                </td>
              </tr>
            ) : (
              displayed.map((suite) => (
                <tr
                  key={suite.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="text-white font-medium">{suite.title}</div>
                    {suite.isSystem && (
                      <span className="text-[10px] text-blue-400 uppercase tracking-wider">
                        системный
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {LANG_FLAGS[suite.language] ?? suite.language}{' '}
                    <span className="uppercase text-xs">{suite.language}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      {SOURCE_LABELS[suite.sourceType] ?? suite.sourceType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {new Date(suite.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(suite.id, suite.title)}
                      disabled={deletingId === suite.id}
                      className="text-red-600 hover:text-red-400 disabled:opacity-30 text-xs uppercase tracking-widest transition-colors"
                    >
                      {deletingId === suite.id ? '...' : 'Удалить'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
