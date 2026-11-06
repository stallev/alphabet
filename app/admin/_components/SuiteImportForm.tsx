'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { importSuiteAction } from '@/games/alphabet/server/actions/import-suite';

import { FileDropzone } from './FileDropzone';
import { ImportResultBanner, type ImportResult } from './ImportResultBanner';
import { ImportTabButton, type ImportTab } from './ImportTabButton';

const PLACEHOLDER = '{\n  "title": "Название набора",\n  "questionsList": [...]\n}';

export function SuiteImportForm() {
  const router = useRouter();
  const [tab, setTab] = useState<ImportTab>('paste');
  const [jsonText, setJsonText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

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
        toast.success(
          `Импортировано: «${res.data.title}» — ${res.data.questionsCount} вопросов`,
        );
        setJsonText('');
        router.refresh();
      } else {
        setResult({ type: 'error', message: res.error });
        toast.error('Импорт не удался');
      }
    } catch {
      setResult({ type: 'error', message: 'Неверный формат JSON. Проверьте синтаксис.' });
      toast.error('Неверный формат JSON');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="mb-5 flex gap-2">
        {(['paste', 'file'] as ImportTab[]).map((tabValue) => (
          <ImportTabButton
            key={tabValue}
            value={tabValue}
            active={tab}
            onSelect={setTab}
            label={tabValue === 'paste' ? 'Вставить JSON' : 'Загрузить файл'}
          />
        ))}
      </div>

      {tab === 'file' ? (
        <FileDropzone
          onFile={(text) => {
            setJsonText(text);
            setResult(null);
          }}
          onError={(message) => setResult({ type: 'error', message })}
          loadedSizeKb={jsonText ? jsonText.length / 1024 : null}
        />
      ) : null}

      {tab === 'paste' ? (
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          placeholder={PLACEHOLDER}
          rows={16}
          spellCheck={false}
          className="w-full resize-none rounded-ctl border border-border bg-surface p-4 text-xs text-fg outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        />
      ) : null}

      {result ? <ImportResultBanner result={result} /> : null}

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
