import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Алфавит: Библейская Викторина и Игра на Память',
  description:
    'Интерактивная командная игра для молодёжных служений. Механика Memory + библейская викторина с поддержкой ИИ.',
  keywords: [
    'библейская игра',
    'христианская викторина',
    'игра алфавит',
    'библейские вопросы',
    'молодёжное служение',
  ],
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
