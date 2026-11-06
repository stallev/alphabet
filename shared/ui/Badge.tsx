import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type BadgeVariant = 'default' | 'accent' | 'success' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-muted text-fg border-border',
  accent: 'bg-accent text-accent-fg border-transparent',
  success: 'bg-success text-success-fg border-transparent',
  danger: 'bg-danger text-danger-fg border-transparent',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-ctl-sm border px-2 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
