import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';

import { Card } from '@/shared/ui/Card';
import { getAllSuites } from '@/games/alphabet/server/suites/get-suites.server';

export const metadata = { title: 'Dashboard' };

async function DashboardStats() {
  await connection();
  const suites = await getAllSuites();
  const total = suites.length;
  const system = suites.filter((s) => s.isSystem).length;
  const custom = suites.filter((s) => !s.isSystem).length;

  const stats = [
    { label: 'Всего наборов', value: total },
    { label: 'Системных', value: system },
    { label: 'Пользовательских', value: custom },
  ];

  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="text-2xl font-bold text-fg tabular-nums">{stat.value}</div>
          <div className="mt-1 text-sm text-fg-muted">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <div className="mb-2 h-9 w-12 animate-pulse rounded-ctl bg-surface-muted" />
          <div className="h-3 w-24 animate-pulse rounded-ctl bg-surface-muted" />
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-fg">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-fg-muted">Управление контентом «Алфавит»</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/suites/import" className="block">
          <Card className="h-full transition-colors hover:bg-surface-muted">
            <div className="mb-2 text-base font-bold text-fg">Импорт JSON</div>
            <p className="text-sm text-fg-muted">
              Загрузить новый набор вопросов из JSON-файла
            </p>
          </Card>
        </Link>
        <Link href="/admin/suites" className="block">
          <Card className="h-full transition-colors hover:bg-surface-muted">
            <div className="mb-2 text-base font-bold text-fg">Все наборы</div>
            <p className="text-sm text-fg-muted">
              Просмотр и управление наборами вопросов
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
