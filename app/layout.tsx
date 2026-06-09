import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AuthSessionProvider } from '@/components/AuthSessionProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700', '900'],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} />
      )}
    </html>
  );
}
