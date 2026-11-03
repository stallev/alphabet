import { getDictionary } from "@/shared/i18n/server";

export default async function GameRouteLoading() {
  const dictionary = await getDictionary();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-fg-muted">
      <p>{dictionary.errors.gameRoute.loading}</p>
    </div>
  );
}
