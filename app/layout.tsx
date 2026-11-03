import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AuthSessionProvider } from '@/shared/providers/AuthSessionProvider';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { getDictionary, getLocale } from '@/shared/i18n/server';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Alphabet: Bible Quiz & Memory Game',
  description:
    'Interactive team Bible game for youth ministries. Memory card mechanic + Bible quiz with AI-generated questions.',
  keywords: [
    'bible game',
    'christian quiz',
    'alphabet game',
    'bible questions',
    'youth ministry',
  ],
  robots: 'noindex, nofollow',
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
