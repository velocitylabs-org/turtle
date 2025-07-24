import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../packages/ui/src/**/*.{ts,tsx,js,jsx}',
  ],
  presets: [require('@velocitylabs-org/turtle-tailwind-config')],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      fontFamily: {
        dazzed: ['var(--font-dazzed)'],
      },
      fontSize: {
        large: '2rem',
      },
    },
  },
  darkMode: 'class',
  plugins: [require('tailwindcss-animate'), require('tailwindcss-motion')],
}
export default config
