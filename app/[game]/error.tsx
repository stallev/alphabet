"use client";

import Link from "next/link";

import { useT } from "@/shared/i18n/I18nProvider";
import { Button } from "@/shared/ui/Button";

export default function GameRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <h1 className="text-xl font-bold text-fg">{t.errors.gameRoute.title}</h1>
      <p className="text-fg-muted">{t.errors.gameRoute.body}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="secondary" size="md" onClick={() => reset()}>
          {t.errors.gameRoute.retry}
        </Button>
        <Link
          href="/"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t.errors.gameRoute.toCatalog}
        </Link>
      </div>
    </div>
  );
}
