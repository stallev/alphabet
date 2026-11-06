'use client';

import { cn } from '@/shared/lib/cn';

export type ImportResult =
  | { type: 'success'; title: string; language: string; count: number }
  | { type: 'error'; message: string };

export interface ImportResultBannerProps {
  result: ImportResult;
}

export function ImportResultBanner({ result }: ImportResultBannerProps) {
  return (
    <div
      className={cn(
        'mt-4 rounded-ctl border p-4 text-sm',
        result.type === 'success'
          ? 'border-success bg-success/10 text-success'
          : 'border-danger bg-danger/10 text-danger',
      )}
      role={result.type === 'error' ? 'alert' : 'status'}
    >
      {result.type === 'success' ? (
        <>
          <span className="font-bold">Импортировано успешно!</span>{' '}
          Набор <span className="font-bold">«{result.title}»</span> —{' '}
          {result.count} вопросов ({result.language})
        </>
      ) : (
        <>
          <span className="font-bold">Ошибка:</span> {result.message}
        </>
      )}
    </div>
  );
}
