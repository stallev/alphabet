'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: 'md' | 'lg';
}

const sizeClasses = {
  md: 'size-10 min-h-10 min-w-10 rounded-ctl',
  lg: 'size-14 min-h-14 min-w-14 rounded-ctl',
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
        'inline-flex items-center justify-center bg-surface text-fg border border-border transition-transform duration-100 hover:bg-surface-muted active:scale-[0.98] active:shadow-press focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
