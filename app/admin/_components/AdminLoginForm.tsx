'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
    <Card padding="lg" className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-fg">Admin Access Required</h1>
        <p className="mt-2 text-sm text-fg-muted">Алфавит System Console</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="admin@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {error ? (
          <p className="rounded-ctl border border-danger bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-2 flex gap-3">
          <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
            Войти
          </Button>
          <Link
            href="/alphabet"
            className="inline-flex items-center justify-center rounded-ctl border border-border bg-surface px-5 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
          >
            Назад
          </Link>
        </div>
      </form>
    </Card>
  );
}
