'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import type { SortDir } from './SuitesTable';

export interface SuiteTableHeadProps {
  sortDir: SortDir;
  onToggleSort: () => void;
}

const STATIC_HEADERS = ['Язык', 'Источник', 'Создан', ''] as const;

export function SuiteTableHead({ sortDir, onToggleSort }: SuiteTableHeadProps) {
  const SortIcon =
    sortDir === 'asc' ? ChevronUp : sortDir === 'desc' ? ChevronDown : ChevronsUpDown;

  return (
    <thead>
      <tr className="border-b border-border">
        <th className="px-5 py-3 text-left text-xs font-semibold text-fg-muted">
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex items-center gap-1 transition-colors hover:text-fg"
            title="Сортировать по названию"
          >
            Название
            <SortIcon className="size-4" aria-hidden />
          </button>
        </th>
        {STATIC_HEADERS.map((h) => (
          <th
            key={h || `th-${h}`}
            className="px-5 py-3 text-left text-xs font-semibold text-fg-muted"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}
