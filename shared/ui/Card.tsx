import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'md' | 'lg';
}

const paddingClasses = {
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface text-fg shadow-card',
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  );
}
