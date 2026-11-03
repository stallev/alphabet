'use client';

import { useT } from '@/shared/i18n/I18nProvider';
import { format } from '@/shared/i18n/format';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';

import { Confetti } from './Confetti';
import { Timer } from './Timer';
import type { LevelOption } from './types';

const LEVEL_SHAPES = [
  'rounded-ctl border-2 border-primary bg-surface-muted',
  'rounded-card border-2 border-dashed border-accent bg-surface',
  'rounded-full border-2 border-fg bg-surface-muted',
] as const;

export interface LevelSelectProps {
  open: boolean;
  levels: LevelOption[];
  timerSeconds?: number;
  onSelect: (id: string) => void;
  onTimeout?: () => void;
  emptyNotice?: string;
  onClose?: () => void;
}

export function LevelSelect({
  open,
  levels,
  timerSeconds = 10,
  onSelect,
  onTimeout,
  emptyNotice,
  onClose,
}: LevelSelectProps) {
  const t = useT();
  const hasAvailable = levels.some((level) => !level.disabled);

  return (
    <Dialog
      open={open}
      onClose={onClose ?? (() => undefined)}
      title={t.gameKit.levelSelect.title}
      closeOnBackdrop={Boolean(onClose)}
    >
      {hasAvailable ? (
        <>
          <div className="flex flex-col gap-3" role="listbox" aria-label={t.gameKit.levelSelect.title}>
            {levels.map((level, index) => {
              const shape = LEVEL_SHAPES[index % LEVEL_SHAPES.length];
              return (
                <button
                  key={level.id}
                  type="button"
                  role="option"
                  disabled={level.disabled}
                  aria-disabled={level.disabled}
                  onClick={() => onSelect(level.id)}
                  className={`flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-fg transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${shape}`}
                >
                  <span className="flex flex-col gap-1">
                    <span className="text-lg font-bold">{level.label}</span>
                    {level.disabled ? (
                      <span className="text-xs font-semibold text-fg-muted">
                        {t.gameKit.levelSelect.finished}
                      </span>
                    ) : level.remaining !== undefined ? (
                      <span className="text-xs text-fg-muted">
                        {format(t.gameKit.levelSelect.remaining, { count: level.remaining })}
                      </span>
                    ) : null}
                  </span>
                  {!level.disabled ? (
                    <span className="text-3xl font-extrabold tabular-nums text-primary">
                      +{level.points}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Timer
              seconds={timerSeconds}
              running={open && hasAvailable}
              onElapsed={() => onTimeout?.()}
              variant="ring"
              label={t.gameKit.levelSelect.title}
            />
            <p className="text-center text-sm text-fg-muted">{t.gameKit.levelSelect.timeoutHint}</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-muted p-6 text-center">
          <p className="font-bold text-fg">{emptyNotice}</p>
          {onClose ? (
            <Button variant="secondary" onClick={onClose}>
              {t.gameKit.close}
            </Button>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
