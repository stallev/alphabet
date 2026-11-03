'use client';

import Link from 'next/link';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { useT } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';

interface GameErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface GameErrorBoundaryState {
  hasError: boolean;
}

export class GameErrorBoundary extends Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  state: GameErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GameErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GameErrorBoundary', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return <GameErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function GameErrorFallback({ onReset }: { onReset: () => void }) {
  const t = useT();

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <h2 className="text-xl font-bold text-fg">{t.gameKit.error.title}</h2>
      <p className="max-w-md text-fg-muted">{t.gameKit.error.body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={onReset}>
          {t.gameKit.retry}
        </Button>
        <Link
          href="/"
          className="inline-flex h-12 min-h-12 items-center justify-center rounded-ctl border border-border px-5 text-base font-semibold text-fg hover:bg-surface-muted"
        >
          {t.gameKit.error.toCatalog}
        </Link>
      </div>
    </div>
  );
}
