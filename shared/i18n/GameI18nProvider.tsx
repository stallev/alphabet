'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

const GameI18nContext = createContext<unknown>(null);

export function GameI18nProvider<T>({
  value,
  children,
}: {
  value: T;
  children: ReactNode;
}) {
  return (
    <GameI18nContext.Provider value={value}>{children}</GameI18nContext.Provider>
  );
}

export function useGameT<T>(): T {
  const value = useContext(GameI18nContext);
  if (value === null) {
    throw new Error('useGameT must be used within GameI18nProvider');
  }
  return value as T;
}
