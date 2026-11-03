'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';

export interface StepperInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function StepperInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: StepperInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(parsed, min, max);
    onChange(next);
    setDraft(String(next));
  };

  const decrement = () => onChange(clamp(value - step, min, max));
  const increment = () => onChange(clamp(value + step, min, max));

  return (
    <div>
      <span className="mb-2 block text-xs font-bold tracking-wide text-fg-muted">
        {label}
      </span>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-ctl border border-border bg-surface shadow-press',
          'focus-within:ring-[3px] focus-within:ring-focus focus-within:ring-offset-2 focus-within:ring-offset-bg',
        )}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex h-12 w-11 shrink-0 items-center justify-center text-lg font-bold text-fg-muted hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          role="spinbutton"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commitDraft(draft)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitDraft(draft);
            }
          }}
          className="h-12 min-w-0 flex-1 border-x border-border bg-transparent text-center text-lg font-bold tabular-nums text-fg outline-none"
        />
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-12 w-11 shrink-0 items-center justify-center text-lg font-bold text-fg-muted hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
