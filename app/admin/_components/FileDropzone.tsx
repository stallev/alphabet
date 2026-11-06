'use client';

export interface FileDropzoneProps {
  onFile: (text: string) => void;
  onError: (message: string) => void;
  loadedSizeKb: number | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function FileDropzone({ onFile, onError, loadedSizeKb }: FileDropzoneProps) {
  function handleFileLoad(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      onError('Файл превышает 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      onFile(ev.target?.result as string);
    };
    reader.readAsText(file);
  }

  return (
    <div className="mb-4">
      <label className="block w-full cursor-pointer rounded-ctl border border-dashed border-border p-8 text-center transition-colors hover:border-primary">
        <div className="mb-2 text-sm text-fg-muted">
          Перетащите .json файл или нажмите для выбора
        </div>
        <div className="text-xs text-fg-muted">Максимум 5 MB</div>
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileLoad}
          className="hidden"
        />
      </label>
      {loadedSizeKb !== null ? (
        <p className="mt-2 text-sm font-semibold text-success">
          Файл загружен ({loadedSizeKb.toFixed(1)} KB)
        </p>
      ) : null}
    </div>
  );
}
