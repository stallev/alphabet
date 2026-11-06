import { notFound } from 'next/navigation';

import { Gallery } from './Gallery';

export const metadata = { robots: { index: false, follow: false } };

export default function GameKitDevPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <Gallery />;
}
