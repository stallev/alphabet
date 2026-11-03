'use client';

import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg shadow-card hover:brightness-95 active:scale-[0.98] active:shadow-press',
  secondary:
    'bg-primary text-primary-fg shadow-card hover:brightness-95 active:scale-[0.98] active:shadow-press',
  ghost:
    'bg-transparent text-fg border border-border hover:bg-surface-muted active:scale-[0.98]',
  danger:
    'bg-danger text-danger-fg shadow-card hover:brightness-95 active:scale-[0.98] active:shadow-press',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-12 min-h-12 px-5 text-base font-semibold rounded-ctl',
  lg: 'h-16 min-h-16 px-6 text-lg font-bold rounded-ctl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-transform duration-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
