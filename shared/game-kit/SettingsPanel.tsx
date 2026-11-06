'use client';

import { type ReactNode } from 'react';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export interface SettingsPanelProps {
  title: string;
  children: ReactNode;
  onStart: () => void;
  startLabel: string;
  startDisabled?: boolean;
}

export function SettingsPanel({
  title,
  children,
  onStart,
  startLabel,
  startDisabled,
}: SettingsPanelProps) {
  return (
    <Card className="flex flex-col gap-6 p-5 md:p-6">
      <h2 className="text-xl font-bold text-fg">{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
      <Button size="lg" className="w-full" disabled={startDisabled} onClick={onStart}>
        {startLabel}
      </Button>
    </Card>
  );
}
