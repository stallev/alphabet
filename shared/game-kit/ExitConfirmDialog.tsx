'use client';

import { useT } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';

export interface ExitConfirmDialogProps {
  open: boolean;
  onStay: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
}

export function ExitConfirmDialog({
  open,
  onStay,
  onConfirm,
  title,
  body,
  confirmLabel,
}: ExitConfirmDialogProps) {
  const t = useT();
  const confirmText = confirmLabel ?? t.gameKit.exit;

  return (
    <Dialog open={open} onClose={onStay} title={title} closeOnBackdrop={false}>
      <p className="text-fg-muted">{body}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button autoFocus variant="secondary" onClick={onStay}>
          {t.gameKit.stay}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
}
