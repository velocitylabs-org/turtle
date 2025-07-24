/** @type {import('tailwindcss').Config} */
import turtleTailwindConfig from '@velocitylabs-org/turtle-tailwind-config'
import tailwindcssAnimate from 'tailwindcss-animate'
import tailwindcssMotion from 'tailwindcss-motion'

const config: import('tailwindcss').Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    '../packages/ui/src/**/*.{ts,tsx,js,jsx}',
  ],
  important: '.turtle-wrapper',
  presets: [turtleTailwindConfig],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  darkMode: ['class'],
  plugins: [tailwindcssAnimate, tailwindcssMotion],
}

export default config
