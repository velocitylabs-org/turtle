const config: import('tailwindcss').Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}', '../packages/ui/src/**/*.{ts,tsx,js,jsx}'],
  important: '.turtle-wrapper',
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
    },
  },
  darkMode: ['class'],
  plugins: [require('tailwindcss-animate'), require('tailwindcss-motion')],
}

export default config
