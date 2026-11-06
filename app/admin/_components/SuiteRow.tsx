import type { QuestionSuite } from '@/generated/client';

import { Badge } from '@/shared/ui/Badge';

import { SuiteSourceBadge } from './SuiteSourceBadge';

export interface SuiteRowProps {
  suite: QuestionSuite;
  deleting: boolean;
  onDelete: (suite: QuestionSuite) => void;
}

export function SuiteRow({ suite, deleting, onDelete }: SuiteRowProps) {
  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted">
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
        <SuiteSourceBadge sourceType={suite.sourceType} />
      </td>
      <td className="px-5 py-4 text-xs text-fg-muted">
        {new Date(suite.createdAt).toLocaleDateString('ru-RU')}
      </td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onDelete(suite)}
          disabled={deleting}
          className="text-xs font-semibold text-danger transition-colors hover:brightness-110 disabled:opacity-40"
        >
          {deleting ? '...' : 'Удалить'}
        </button>
      </td>
    </tr>
  );
}
