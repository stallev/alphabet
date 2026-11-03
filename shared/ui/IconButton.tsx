'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: 'md' | 'lg';
}

const sizeClasses = {
  md: 'size-12 min-h-12 min-w-12 rounded-ctl',
  lg: 'size-16 min-h-16 min-w-16 rounded-ctl',
};

export function IconButton({
  size = 'md',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center bg-surface text-fg border border-border shadow-card transition-transform duration-100 hover:bg-surface-muted active:scale-[0.98] active:shadow-press focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
