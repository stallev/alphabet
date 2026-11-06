'use client';

import { cn } from '@/shared/lib/cn';

export interface SuiteLangFilterProps {
  languages: string[];
  value: string;
  onChange: (lang: string) => void;
}

export function SuiteLangFilter({ languages, value, onChange }: SuiteLangFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={cn(
            'inline-flex items-center rounded-ctl-sm border px-2.5 py-1 text-xs font-semibold transition-colors',
            value === lang
              ? 'border-primary bg-primary text-primary-fg'
              : 'border-border bg-surface text-fg-muted hover:bg-surface-muted hover:text-fg',
          )}
        >
          {lang === 'all' ? 'Все языки' : lang}
        </button>
      ))}
    </div>
  );
}
