import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { manrope } from '@/app/fonts/manrope';
import { AuthSessionProvider } from '@/shared/providers/AuthSessionProvider';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { getDictionary, getLocale } from '@/shared/i18n/server';
import { SITE } from '@/shared/config/site';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  robots: SITE.indexable ? 'index, follow' : 'noindex, nofollow',
  openGraph: {
    siteName: SITE.name,
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
      </body>
      {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} />
      )}
    </html>
  );
}
