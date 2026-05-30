'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsPending(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Неверный email или пароль');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Ошибка входа. Попробуйте снова.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/20 p-10 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.08)]">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-red-500 font-black text-lg uppercase tracking-widest">
          Admin Access Required
        </h1>
        <p className="text-slate-500 text-xs mt-2">Алфавит System Console</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-500 text-[10px] uppercase tracking-widest mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@example.com"
            className="w-full bg-black/50 border-2 border-slate-800 focus:border-emerald-500 p-3 rounded-xl text-white outline-none transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-500 text-[10px] uppercase tracking-widest mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-black/50 border-2 border-slate-800 focus:border-emerald-500 p-3 rounded-xl text-white outline-none transition-colors text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all"
          >
            {isPending ? 'Вход...' : 'Войти'}
          </button>
          <a
            href="/game"
            className="px-5 py-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all text-sm"
          >
            Назад
          </a>
        </div>
      </form>
    </div>
  );
}
