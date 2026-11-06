'use client';

import { cn } from '@/shared/lib/cn';

export type ImportTab = 'paste' | 'file';

export interface ImportTabButtonProps {
  value: ImportTab;
  active: ImportTab;
  onSelect: (value: ImportTab) => void;
  label: string;
}

export function ImportTabButton({
  value,
  active,
  onSelect,
  label,
}: ImportTabButtonProps) {
  const isActive = value === active;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'rounded-ctl border px-4 py-2 text-sm font-semibold transition-colors',
        isActive
          ? 'border-primary bg-primary text-primary-fg'
          : 'border-border bg-surface text-fg-muted hover:bg-surface-muted hover:text-fg',
      )}
    >
      {label}
    </button>
  );
}
