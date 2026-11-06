import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { manrope } from '@/app/fonts/manrope';
import { AuthSessionProvider } from '@/shared/providers/AuthSessionProvider';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { Toaster } from '@/shared/ui/Toaster';
import { getDictionary, getLocale } from '@/shared/i18n/server';
import { SITE } from '@/shared/config/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  robots: SITE.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    ...(SITE.twitter ? { site: SITE.twitter, creator: SITE.twitter } : {}),
  },
  verification: {
    google: "hfUfm63J8LQu36epeUhZEHXJY7D5lMm1Fo07mWbKt9I",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dictionary = await getDictionary();

  return (
    <html lang={locale}>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <I18nProvider locale={locale} dictionary={dictionary}>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </I18nProvider>
        <Toaster />
      </body>
      {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} />
      )}
    </html>
  );
}
