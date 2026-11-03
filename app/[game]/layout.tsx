import type { ReactNode } from 'react';

export default function GameRouteLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-bg">{children}</div>;
}
