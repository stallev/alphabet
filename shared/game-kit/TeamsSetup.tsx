'use client';

import { useT } from '@/shared/i18n/I18nProvider';
import { format } from '@/shared/i18n/format';
import { Input } from '@/shared/ui/Input';

import { StepperInput } from './StepperInput';

export interface TeamsSetupValue {
  count: number;
  names: string[];
}

export interface TeamsSetupProps {
  value: TeamsSetupValue;
  min: number;
  max: number;
  onChange: (value: TeamsSetupValue) => void;
}

function normalizeNames(count: number, names: string[], defaultName: (index: number) => string) {
  const next = names.slice(0, count);
  while (next.length < count) {
    next.push(defaultName(next.length));
  }
  return next;
}

export function TeamsSetup({ value, min, max, onChange }: TeamsSetupProps) {
  const t = useT();
  const defaultName = (index: number) =>
    format(t.gameKit.setup.defaultTeamName, { n: index + 1 });

  const handleCountChange = (count: number) => {
    onChange({
      count,
      names: normalizeNames(count, value.names, defaultName),
    });
  };

  const handleNameChange = (index: number, name: string) => {
    const names = [...value.names];
    names[index] = name;
    onChange({ count: value.count, names });
  };

  const handleNameBlur = (index: number) => {
    if ((value.names[index]?.trim() ?? '') !== '') {
      return;
    }
    const names = [...value.names];
    names[index] = defaultName(index);
    onChange({ count: value.count, names });
  };

  return (
    <div className="flex flex-col gap-4">
      <StepperInput
        label={t.gameKit.setup.teamsCount}
        value={value.count}
        min={min}
        max={max}
        step={1}
        onChange={handleCountChange}
      />
      <div>
        <p className="mb-3 text-sm font-semibold text-fg">{t.gameKit.setup.teamNames}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: value.count }, (_, index) => (
            <Input
              key={index}
              label={format(t.gameKit.setup.teamField, { n: index + 1 })}
              value={value.names[index] ?? ''}
              maxLength={20}
              onChange={(event) => handleNameChange(index, event.target.value)}
              onBlur={() => handleNameBlur(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
