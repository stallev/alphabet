'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';

import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Dialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';
import { LocaleSwitcher } from '@/shared/i18n/LocaleSwitcher';
import { useT } from '@/shared/i18n/I18nProvider';

import { KitShowcase } from './KitShowcase';
import { KitCu4Showcase } from './KitCu4Showcase';

const COLOR_PAIRS: { bg: string; fg: string; label: string }[] = [
  { bg: 'bg-bg', fg: 'text-fg', label: 'fg on bg' },
  { bg: 'bg-surface', fg: 'text-fg', label: 'fg on surface' },
  { bg: 'bg-primary', fg: 'text-primary-fg', label: 'primary-fg on primary' },
  { bg: 'bg-accent', fg: 'text-accent-fg', label: 'accent-fg on accent' },
  { bg: 'bg-success', fg: 'text-success-fg', label: 'success-fg on success' },
  { bg: 'bg-danger', fg: 'text-danger-fg', label: 'danger-fg on danger' },
];

const TEAM_CLASSES = [
  'bg-team-1 text-team-1-fg',
  'bg-team-2 text-team-2-fg',
  'bg-team-3 text-team-3-fg',
  'bg-team-4 text-team-4-fg',
  'bg-team-5 text-team-5-fg',
  'bg-team-6 text-team-6-fg',
] as const;

const GAME_CLASSES = [
  'bg-game-1',
  'bg-game-2',
  'bg-game-3',
  'bg-game-4',
  'bg-game-5',
] as const;

const HEX: Record<string, string> = {
  bg: '#eaf2f4',
  fg: '#12303a',
  surface: '#ffffff',
  primary: '#0f766e',
  'primary-fg': '#ffffff',
  accent: '#f5a524',
  'accent-fg': '#12303a',
  success: '#15803d',
  'success-fg': '#ffffff',
  danger: '#b4452a',
  'danger-fg': '#ffffff',
};

function parseHex(hex: string) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const int = Number.parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = parseHex(hex);
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fgHex: string, bgHex: string) {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ContrastTable() {
  const rows = COLOR_PAIRS.map(({ label, bg, fg }) => {
    const bgKey = bg.replace('bg-', '');
    const fgKey = fg.replace('text-', '');
    const ratio = contrastRatio(HEX[fgKey], HEX[bgKey]).toFixed(2);
    return { label, ratio };
  });
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="py-2 font-semibold">Pair</th>
          <th className="py-2 font-semibold">Contrast</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-border">
            <td className="py-2">{row.label}</td>
            <td className="py-2 tabular-nums">{row.ratio}:1</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Gallery() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const t = useT();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-fg">Game kit gallery</h1>
          <p className="mt-2 text-fg-muted">{t.site.tagline}</p>
          <p className="mt-1 text-sm text-fg-muted">{t.catalog.title}</p>
        </div>
        <LocaleSwitcher />
      </header>

      <section aria-labelledby="tokens-heading" className="flex flex-col gap-4">
        <h2 id="tokens-heading" className="text-2xl font-bold text-fg">
          Tokens
        </h2>
        <Card className="flex flex-col gap-6">
          <ContrastTable />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_PAIRS.map(({ bg, fg, label }) => (
              <div key={label} className={`rounded-ctl border border-border p-4 ${bg}`}>
                <span className={`font-semibold ${fg}`}>{label}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-fg">Manrope scale</p>
            <p className="text-sm text-fg-muted">Body 18 px base</p>
            <p className="text-base font-medium text-fg">Medium 500</p>
            <p className="text-lg font-semibold text-fg">Semibold 600</p>
            <p className="text-xl font-bold text-fg">Bold 700</p>
            <p className="text-2xl font-extrabold text-fg">ExtraBold 800</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="h-16 w-32 rounded-ctl bg-surface shadow-press" />
            <div className="h-16 w-32 rounded-card bg-surface shadow-card" />
          </div>
          <div className="flex flex-wrap gap-2">
            {TEAM_CLASSES.map((className, index) => (
              <div
                key={className}
                className={`flex h-12 min-w-12 items-center justify-center rounded-ctl font-bold tabular-nums ${className}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {GAME_CLASSES.map((className) => (
              <div
                key={className}
                className={`h-14 w-14 rounded-card shadow-card ${className}`}
              />
            ))}
          </div>
        </Card>
      </section>

      <section aria-labelledby="primitives-heading" className="flex flex-col gap-4">
        <h2 id="primitives-heading" className="text-2xl font-bold text-fg">
          Primitives
        </h2>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Large action</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
          <IconButton aria-label="Open settings">
            <Settings className="size-5" aria-hidden />
          </IconButton>
          <Input label="Player name" placeholder="Team name" />
          <Input label="With error" error="Required field" defaultValue="" />
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Sample dialog"
          >
            <p className="text-fg-muted">Native dialog with focus return and Esc support.</p>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </div>
          </Dialog>
        </Card>
      </section>

      <KitShowcase />
      <KitCu4Showcase />
    </main>
  );
}
