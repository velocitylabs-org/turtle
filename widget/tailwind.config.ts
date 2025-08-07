/** @type {import('tailwindcss').Config} */
import turtleTailwindConfig from '@velocitylabs-org/turtle-tailwind-config'
import tailwindcssAnimate from 'tailwindcss-animate'
import tailwindcssMotion from 'tailwindcss-motion'

const config: import('tailwindcss').Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}', '../packages/ui/src/**/*.{ts,tsx,js,jsx}'],
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
    },
  },
  darkMode: ['class'],
  plugins: [tailwindcssAnimate, tailwindcssMotion],
}

export default config
