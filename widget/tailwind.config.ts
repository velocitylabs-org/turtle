/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'
import tailwindcssMotion from 'tailwindcss-motion'

const prefix = 'turtle'

export const colors = {
  [`${prefix}-primary`]: 'var(--turtle-primary)',
  [`${prefix}-primary-dark`]: 'var(--turtle-primary-dark)',
  [`${prefix}-primary-light`]: 'var(--turtle-primary-light)',

  [`${prefix}-secondary`]: 'var(--turtle-secondary)',
  [`${prefix}-secondary-50`]: 'var(--turtle-secondary-50)',
  [`${prefix}-secondary-transparent`]: 'var(--turtle-secondary-transparent)',
  [`${prefix}-secondary-dark`]: 'var(--turtle-secondary-dark)',
  [`${prefix}-secondary-dark-40`]: 'var(--turtle-secondary-dark-40)',
  [`${prefix}-secondary-light`]: 'var(--turtle-secondary-light)',
  [`${prefix}-secondary-light-50`]: 'var(--turtle-secondary-light-50)',

  [`${prefix}-tertiary`]: 'var(--turtle-tertiary)',
  [`${prefix}-tertiary-70`]: 'var(--turtle-tertiary-70)',
  [`${prefix}-tertiary-dark`]: 'var(--turtle-tertiary-dark)',
  [`${prefix}-tertiary-dark-60`]: 'var(--turtle-tertiary-dark-60)',
  [`${prefix}-tertiary-light`]: 'var(--turtle-tertiary-light)',

  [`${prefix}-background`]: 'var(--turtle-background)',
  [`${prefix}-foreground`]: 'var(--turtle-foreground)',

  [`${prefix}-level1`]: 'var(--turtle-level1)',
  [`${prefix}-level2`]: 'var(--turtle-level2)',
  [`${prefix}-level3`]: 'var(--turtle-level3)',
  [`${prefix}-level4`]: 'var(--turtle-level4)',
  [`${prefix}-level5`]: 'var(--turtle-level5)',
  [`${prefix}-level6`]: 'var(--turtle-level6)',

  [`${prefix}-success`]: 'var(--turtle-success)',
  [`${prefix}-success-dark`]: 'var(--turtle-success-dark)',
  [`${prefix}-success-light`]: 'var(--turtle-success-light)',

  [`${prefix}-warning`]: 'var(--turtle-warning)',
  [`${prefix}-warning-dark`]: 'var(--turtle-warning-dark)',
  [`${prefix}-warning-light`]: 'var(--turtle-warning-light)',

  [`${prefix}-error`]: 'var(--turtle-error)',
  [`${prefix}-error/10`]: 'var(--turtle-error-10)',
  [`${prefix}-error-dark`]: 'var(--turtle-error-dark)',
  [`${prefix}-error-light`]: 'var(--turtle-error-light)',

  [`${prefix}-note-warn`]: 'var(--turtle-note-warn)',
}

const config: import('tailwindcss').Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    '../packages/ui/src/**/*.{ts,tsx,js,jsx}',
  ],
  important: '.turtle-wrapper',
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      colors,
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundColor: {
        'btn-disabled': colors[`${prefix}-primary`],
        'dialog-overlay':
          'rgba(var(--turtle-dialog-overlay-rgb), var(--turtle-dialog-overlay-opacity))',
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
