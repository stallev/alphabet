import { SITE } from '@/shared/config/site';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface px-4 py-8 text-center text-sm text-fg-muted md:px-6 xl:px-8">
      <p>
        © {year} {SITE.name}
      </p>
    </footer>
  );
}
