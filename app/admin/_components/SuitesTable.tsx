'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { QuestionSuite } from '@/generated/client';

import { Card } from '@/shared/ui/Card';
import { ExitConfirmDialog } from '@/shared/game-kit';
import { deleteSuiteAction } from '@/games/alphabet/server/actions/delete-suite';

import { SuiteLangFilter } from './SuiteLangFilter';
import { SuiteRow } from './SuiteRow';
import { SuiteTableHead } from './SuiteTableHead';

export type SortDir = 'asc' | 'desc' | null;

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
      toast.success(`Набор «${suite.title}» удалён`);
      router.refresh();
    } else {
      setError(`Ошибка: ${result.error}`);
      toast.error('Не удалось удалить набор');
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SuiteLangFilter languages={languages} value={langFilter} onChange={setLangFilter} />
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
          <SuiteTableHead sortDir={sortDir} onToggleSort={toggleSort} />
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-fg-muted">
                  Нет наборов для выбранного языка
                </td>
              </tr>
            ) : (
              displayed.map((suite) => (
                <SuiteRow
                  key={suite.id}
                  suite={suite}
                  deleting={deletingId === suite.id}
                  onDelete={setConfirmSuite}
                />
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
