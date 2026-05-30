import { getAllSuites } from '@/src/data/suites/get-suites.server';
import Link from 'next/link';

export const metadata = { title: 'Admin Dashboard — Алфавит' };

export default async function AdminDashboardPage() {
  const suites = await getAllSuites();

  const total = suites.length;
  const system = suites.filter((s) => s.isSystem).length;
  const custom = suites.filter((s) => !s.isSystem).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-emerald-500 uppercase tracking-tighter">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 text-xs mt-1">Управление контентом «Алфавит»</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Всего наборов', value: total, color: 'text-emerald-400' },
          { label: 'Системных', value: system, color: 'text-blue-400' },
          { label: 'Пользовательских', value: custom, color: 'text-amber-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-white/5 rounded-2xl p-6"
          >
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-500 text-xs uppercase tracking-widest mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/suites/import"
          className="bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-6 transition-all group"
        >
          <div className="text-emerald-500 font-black text-lg mb-2">
            Импорт JSON
          </div>
          <p className="text-slate-500 text-sm">
            Загрузить новый набор вопросов из JSON-файла
          </p>
        </Link>
        <Link
          href="/admin/suites"
          className="bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all group"
        >
          <div className="text-white font-black text-lg mb-2">
            Все наборы
          </div>
          <p className="text-slate-500 text-sm">
            Просмотр и управление наборами вопросов
          </p>
        </Link>
      </div>
    </div>
  );
}
