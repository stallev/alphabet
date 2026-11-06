'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/shared/ui/Button';

export function AdminSignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
    >
      Выйти
    </Button>
  );
}
