import Link from 'next/link';
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';

export const metadata = { title: 'Admin — Алфавит' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-black/40 border-r border-emerald-500/10 flex flex-col z-50">
        <div className="p-5 border-b border-emerald-500/10">
          <span className="text-emerald-500 font-black text-sm uppercase tracking-widest">
            Алфавит Admin
          </span>
          <div className="text-emerald-500/30 text-[10px] mt-1">System Console</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
          >
            Дашборд
          </Link>
          <Link
            href="/admin/suites"
            className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
          >
            Наборы вопросов
          </Link>
          <Link
            href="/admin/suites/import"
            className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
          >
            Импорт JSON
          </Link>
          <Link
            href="/game"
            className="block px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors mt-4 border-t border-slate-800 pt-4"
          >
            ← Игра
          </Link>
        </nav>

        <div className="p-4 border-t border-emerald-500/10 space-y-2">
          <Link
            href="/admin/login"
            className="block px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
          >
            Страница входа
          </Link>
          <AdminSignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
