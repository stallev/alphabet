'use client';

import { AlertTriangle } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import { useCountdown } from './use-countdown';

export interface TimerProps {
  seconds: number;
  running: boolean;
  onElapsed: () => void;
  variant?: 'inline' | 'ring' | 'bar';
  orientation?: 'horizontal' | 'vertical';
  tone?: 'primary' | 'accent';
  label?: string;
}

export function Timer({
  seconds,
  running,
  onElapsed,
  variant = 'inline',
  orientation = 'horizontal',
  tone = 'accent',
  label,
}: TimerProps) {
  const secondsLeft = useCountdown({ seconds, running, onElapsed });
  const isUrgent = secondsLeft > 0 && secondsLeft < 5;
  const progress = seconds > 0 ? (secondsLeft / seconds) * 100 : 0;
  const toneClass = tone === 'primary' ? 'text-primary' : 'text-accent';
  const barClass = isUrgent ? 'bg-danger' : tone === 'primary' ? 'bg-primary' : 'bg-accent';

  if (variant === 'ring') {
    const size = 100;
    const strokeWidth = isUrgent ? 10 : 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
      <div
        role="timer"
        aria-label={label}
        className="relative mx-auto flex aspect-square w-full max-w-36 items-center justify-center"
      >
        <svg className="h-full w-full" viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="text-border"
            stroke="currentColor"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={isUrgent ? 'text-danger' : toneClass}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={isUrgent ? { strokeDasharray: '6 6' } : undefined}
          />
        </svg>
        <span
          className={cn(
            'absolute text-3xl font-extrabold tabular-nums',
            isUrgent ? 'text-danger' : 'text-fg',
          )}
        >
          {secondsLeft}
        </span>
        {isUrgent ? (
          <AlertTriangle
            className="absolute right-0 top-0 size-5 text-danger"
            aria-hidden
          />
        ) : null}
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div role="timer" aria-label={label} className="w-full">
        <div className="mb-1 flex justify-between text-sm font-semibold text-fg-muted">
          <span>{label}</span>
          <span className={isUrgent ? 'text-danger' : undefined}>{secondsLeft}s</span>
        </div>
        <div
          className={cn(
            'overflow-hidden rounded-full bg-surface-muted',
            orientation === 'vertical' ? 'h-32 w-4' : 'h-3 w-full',
          )}
        >
          <div
            className={cn('h-full rounded-full transition-[width] duration-1000', barClass)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="timer"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-2 rounded-ctl border px-3 py-2 font-extrabold tabular-nums',
        isUrgent
          ? 'border-danger bg-danger/10 text-danger'
          : 'border-border bg-surface text-fg',
      )}
    >
      {isUrgent ? <AlertTriangle className="size-5 shrink-0" aria-hidden /> : null}
      <span>{secondsLeft}s</span>
    </div>
  );
}
