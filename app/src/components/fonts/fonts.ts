import localFont from 'next/font/local'

export const dazzed = localFont({
  src: [
    {
      path: './dazzed.woff2',
      weight: '400',
    },
    {
      path: './dazzed-bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-dazzed',
  display: 'swap',
})
