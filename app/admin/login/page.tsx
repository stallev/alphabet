import { Suspense } from 'react';
import { AdminLoginForm } from '@/app/admin/_components/AdminLoginForm';
import { Card } from '@/shared/ui/Card';

export const metadata = { title: 'Login' };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <Suspense
        fallback={
          <Card padding="lg" className="w-full max-w-md text-center">
            <p className="text-sm text-fg-muted">Loading...</p>
          </Card>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
