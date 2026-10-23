"use client";

import Link from "next/link";

export default function GameRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-xl font-bold text-foreground">Не удалось загрузить игру</h1>
      <p className="text-muted-foreground">Попробуйте ещё раз или вернитесь в каталог.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Повторить
        </button>
        <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          В каталог
        </Link>
      </div>
    </div>
  );
}
