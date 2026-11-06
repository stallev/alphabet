'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/cn';
import { importSuiteAction } from '@/games/alphabet/server/actions/import-suite';

type Tab = 'paste' | 'file';

export function SuiteImportForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('paste');
  const [jsonText, setJsonText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<
    | { type: 'success'; title: string; language: string; count: number }
    | { type: 'error'; message: string }
    | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!jsonText.trim()) {
      setResult({ type: 'error', message: 'Введите JSON или загрузите файл' });
      return;
    }

    setIsPending(true);
    setResult(null);

    try {
      const parsed = JSON.parse(jsonText);
      const res = await importSuiteAction(parsed);

      if (res.success) {
        setResult({
          type: 'success',
          title: res.data.title,
          language: res.data.language,
          count: res.data.questionsCount,
        });
        setJsonText('');
        router.refresh();
      } else {
        setResult({ type: 'error', message: res.error });
      }
    } catch {
      setResult({ type: 'error', message: 'Неверный формат JSON. Проверьте синтаксис.' });
    } finally {
      setIsPending(false);
    }
  }

  function handleFileLoad(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setResult({ type: 'error', message: 'Файл превышает 5 MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target?.result as string);
      setResult(null);
    };
    reader.readAsText(file);
  }

  return (
    <Card padding="lg">
      <div className="mb-5 flex gap-2">
        {(['paste', 'file'] as Tab[]).map((tabValue) => (
          <button
            key={tabValue}
            type="button"
            onClick={() => setTab(tabValue)}
            className={cn(
              'rounded-ctl border px-4 py-2 text-sm font-semibold transition-colors',
              tab === tabValue
                ? 'border-primary bg-primary text-primary-fg'
                : 'border-border bg-surface text-fg-muted hover:bg-surface-muted hover:text-fg',
            )}
          >
            {tabValue === 'paste' ? 'Вставить JSON' : 'Загрузить файл'}
          </button>
        ))}
      </div>

      {tab === 'file' ? (
        <div className="mb-4">
          <label className="block w-full cursor-pointer rounded-ctl border border-dashed border-border p-8 text-center transition-colors hover:border-primary">
            <div className="mb-2 text-sm text-fg-muted">
              Перетащите .json файл или нажмите для выбора
            </div>
            <div className="text-xs text-fg-muted">Максимум 5 MB</div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileLoad}
              className="hidden"
            />
          </label>
          {jsonText ? (
            <p className="mt-2 text-sm font-semibold text-success">
              Файл загружен ({(jsonText.length / 1024).toFixed(1)} KB)
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === 'paste' ? (
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          placeholder={'{\n  "title": "Название набора",\n  "questionsList": [...]\n}'}
          rows={16}
          spellCheck={false}
          className="w-full resize-none rounded-ctl border border-border bg-surface p-4 text-xs text-fg outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        />
      ) : null}

      {result ? (
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
      ) : null}

      <div className="mt-5 flex gap-3">
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={isPending || !jsonText.trim()}
          loading={isPending}
        >
          {isPending ? 'Импорт...' : 'Импортировать набор'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setJsonText('');
            setResult(null);
          }}
        >
          Очистить
        </Button>
      </div>
    </Card>
  );
}
