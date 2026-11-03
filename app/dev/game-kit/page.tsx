import { notFound } from 'next/navigation';

import { Gallery } from './Gallery';

export default function GameKitDevPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <Gallery />;
}
