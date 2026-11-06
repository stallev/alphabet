'use client';

import { Toaster as SonnerToaster } from 'sonner';

import { PRODUCT_TOAST_DURATION_MS } from '@/shared/ui/product-toast';

/**
 * Глобальный Toaster (Sonner) — единственный на приложение.
 * Подключается в корневом `app/layout.tsx`. Дублирование провайдеров запрещено
 * (`ui-toast-mutations.mdc`).
 *
 * Тема — только светлая (dark mode не подключён, см. `app/globals.css`).
 * Стилизация — через design tokens (`bg-surface`, `text-fg`, `border-border`).
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      duration={PRODUCT_TOAST_DURATION_MS}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'rounded-ctl border border-border bg-surface text-fg shadow-card',
          title: 'text-sm font-semibold text-fg',
          description: 'text-sm text-fg-muted',
          actionButton: 'bg-primary text-primary-fg',
          cancelButton: 'bg-surface-muted text-fg-muted',
          error: 'border-danger',
          success: 'border-success',
        },
      }}
    />
  );
}
