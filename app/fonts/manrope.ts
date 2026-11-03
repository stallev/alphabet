import localFont from 'next/font/local';

/** Self-hosted Manrope (latin + cyrillic, 500–800) — avoids compile-time Google Fonts fetch in Turbopack. */
export const manrope = localFont({
  src: [
    {
      path: './manrope-cyrillic-ext.woff2',
      weight: '500 800',
      style: 'normal',
    },
    {
      path: './manrope-cyrillic.woff2',
      weight: '500 800',
      style: 'normal',
    },
    {
      path: './manrope-latin-ext.woff2',
      weight: '500 800',
      style: 'normal',
    },
    {
      path: './manrope-latin.woff2',
      weight: '500 800',
      style: 'normal',
    },
  ],
  variable: '--font-manrope',
  display: 'swap',
});
