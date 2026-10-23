'use client';

import { signOut } from 'next-auth/react';

export function AdminSignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="w-full text-xs text-slate-600 hover:text-red-400 transition-colors uppercase tracking-widest py-2"
    >
      Выйти
    </button>
  );
}
