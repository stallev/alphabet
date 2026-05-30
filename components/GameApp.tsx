'use client';

import App from '../App';
import type { QuestionsSuite } from '@/types';

interface GameAppProps {
  initialSuites: QuestionsSuite[];
}

export function GameApp({ initialSuites }: GameAppProps) {
  return <App initialSuites={initialSuites} />;
}
