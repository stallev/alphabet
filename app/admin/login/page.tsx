import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const metadata = { title: 'Admin Login — Alphabet' };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 p-10 rounded-3xl text-center">
          <div className="text-slate-600 text-sm animate-pulse">Loading...</div>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
