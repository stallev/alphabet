'use client';

import { useT } from '@/shared/i18n/I18nProvider';
import { Dialog } from '@/shared/ui/Dialog';

import type { RulesContent } from './types';

export interface RulesDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: RulesContent;
}

export function RulesDialog({ open, onClose, title, content }: RulesDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto pr-1">
        {content.map((section) => (
          <section key={section.heading}>
            <h3 className="text-lg font-bold text-fg">{section.heading}</h3>
            <div className="mt-2 text-fg-muted">{section.body}</div>
          </section>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="min-h-12 rounded-ctl bg-primary px-5 text-base font-semibold text-primary-fg"
          onClick={onClose}
        >
          {t.gameKit.close}
        </button>
      </div>
    </Dialog>
  );
}
