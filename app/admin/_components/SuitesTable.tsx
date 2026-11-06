'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import type { QuestionSuite } from '@/generated/client';

import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/cn';
import { ExitConfirmDialog } from '@/shared/game-kit';
import { deleteSuiteAction } from '@/games/alphabet/server/actions/delete-suite';

const SOURCE_LABELS: Record<string, string> = {
  json: 'JSON',
  manual: 'Вручную',
  ai: 'AI',
  system: 'Система',
};

type SortDir = 'asc' | 'desc' | null;

interface SuitesTableProps {
  suites: QuestionSuite[];
}

export function SuitesTable({ suites }: SuitesTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmSuite, setConfirmSuite] = useState<QuestionSuite | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  async function handleDelete(suite: QuestionSuite) {
    setConfirmSuite(null);
    setDeletingId(suite.id);
    setError(null);
    const result = await deleteSuiteAction(suite.id);
    setDeletingId(null);

    if (result.success) {
      router.refresh();
    } else {
      setError(`Ошибка: ${result.error}`);
    }
  }

  if (suites.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm text-fg-muted">Наборы вопросов не найдены</p>
        <Link
          href="/admin/suites/import"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Импортировать первый набор →
        </Link>
      </Card>
    );
  }

  const SortIcon =
    sortDir === 'asc' ? ChevronUp : sortDir === 'desc' ? ChevronDown : ChevronsUpDown;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLangFilter(lang)}
            className={cn(
              'inline-flex items-center rounded-ctl-sm border px-2.5 py-1 text-xs font-semibold transition-colors',
              langFilter === lang
                ? 'border-primary bg-primary text-primary-fg'
                : 'border-border bg-surface text-fg-muted hover:bg-surface-muted hover:text-fg',
            )}
          >
            {lang === 'all' ? 'Все языки' : lang}
          </button>
        ))}
        <span className="ml-auto text-xs text-fg-muted">
          {displayed.length} из {suites.length}
        </span>
      </div>

      {error ? (
        <p
          className="rounded-ctl border border-danger bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Card padding="md" className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-semibold text-fg-muted">
                <button
                  type="button"
                  onClick={toggleSort}
                  className="inline-flex items-center gap-1 transition-colors hover:text-fg"
                  title="Сортировать по названию"
                >
                  Название
                  <SortIcon className="size-4" aria-hidden />
                </button>
              </th>
              {['Язык', 'Источник', 'Создан', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-fg-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-fg-muted">
                  Нет наборов для выбранного языка
                </td>
              </tr>
            ) : (
              displayed.map((suite) => (
                <tr
                  key={suite.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-fg">{suite.title}</div>
                    {suite.isSystem ? (
                      <Badge variant="accent" className="mt-1">
                        системный
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-fg-muted">
                    <span className="text-xs font-semibold">{suite.language}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge>{SOURCE_LABELS[suite.sourceType] ?? suite.sourceType}</Badge>
                  </td>
                  <td className="px-5 py-4 text-xs text-fg-muted">
                    {new Date(suite.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setConfirmSuite(suite)}
                      disabled={deletingId === suite.id}
                      className="text-xs font-semibold text-danger transition-colors hover:brightness-110 disabled:opacity-40"
                    >
                      {deletingId === suite.id ? '...' : 'Удалить'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <ExitConfirmDialog
        open={confirmSuite !== null}
        onStay={() => setConfirmSuite(null)}
        onConfirm={() => confirmSuite && handleDelete(confirmSuite)}
        title="Удаление набора"
        body={confirmSuite ? `Удалить набор «${confirmSuite.title}»? Все вопросы будут удалены.` : ''}
        confirmLabel="Удалить"
      />
    </div>
  );
}
