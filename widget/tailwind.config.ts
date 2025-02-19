/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'

const prefix = 'turtle'

export const colors = {
  [`${prefix}-primary`]: '#00FF29',
  [`${prefix}-primary-dark`]: '#008115',
  [`${prefix}-primary-light`]: '#D9FFDF',

  [`${prefix}-secondary`]: '#A184DC',
  [`${prefix}-secondary-transparent`]: '#A184DC26',
  [`${prefix}-secondary-dark`]: '#513589',
  [`${prefix}-secondary-light`]: '#F1EDFA',

  [`${prefix}-tertiary`]: '#BFDADC',
  [`${prefix}-tertiary-dark`]: '#196065',
  [`${prefix}-tertiary-light`]: '#E1FDFF',

  [`${prefix}-background`]: '#FFFFFF',
  [`${prefix}-foreground`]: '#001B04',

  [`${prefix}-level1`]: '#F6F8FA',
  [`${prefix}-level2`]: '#EBEFF3',
  [`${prefix}-level3`]: '#C5D1DB',
  [`${prefix}-level4`]: '#A9B8C8',
  [`${prefix}-level5`]: '#90A1AE',
  [`${prefix}-level6`]: '#546573',

  [`${prefix}-success`]: '#00FF29',
  [`${prefix}-success-dark`]: '#008115',
  [`${prefix}-success-light`]: '#D9FFDF',

  [`${prefix}-warning`]: '#FFFF00',
  [`${prefix}-warning-dark`]: '#7A7C00',
  [`${prefix}-warning-light`]: '#FFFFD9',

  [`${prefix}-error`]: '#ff35c3',
  [`${prefix}-error/10`]: '#ff35c31a',
  [`${prefix}-error-dark`]: '#8D1269',
  [`${prefix}-error-light`]: '#FFE1F6',

  [`${prefix}-note-warn`]: '#FFFF0026',

  // to match the @layer base from index.css
  border: 'hsl(var(--border))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
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
      fontFamily: {
        dazzed: ['var(--font-dazzed)'],
      },
      fontSize: {
        large: '2rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundColor: {
        'btn-disabled': colors[`${prefix}-primary`],
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
  plugins: [tailwindcssAnimate],
}

// module.exports = {
//   darkMode: ['class'],
//   content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
//   theme: {
//     extend: {
//       borderRadius: {
//         lg: 'var(--radius)',
//         md: 'calc(var(--radius) - 2px)',
//         sm: 'calc(var(--radius) - 4px)',
//       },
//       colors: {
//         background: 'hsl(var(--background))',
//         foreground: 'hsl(var(--foreground))',
//         card: {
//           DEFAULT: 'hsl(var(--card))',
//           foreground: 'hsl(var(--card-foreground))',
//         },
//         popover: {
//           DEFAULT: 'hsl(var(--popover))',
//           foreground: 'hsl(var(--popover-foreground))',
//         },
//         primary: {
//           DEFAULT: 'hsl(var(--primary))',
//           foreground: 'hsl(var(--primary-foreground))',
//         },
//         secondary: {
//           DEFAULT: 'hsl(var(--secondary))',
//           foreground: 'hsl(var(--secondary-foreground))',
//         },
//         muted: {
//           DEFAULT: 'hsl(var(--muted))',
//           foreground: 'hsl(var(--muted-foreground))',
//         },
//         accent: {
//           DEFAULT: 'hsl(var(--accent))',
//           foreground: 'hsl(var(--accent-foreground))',
//         },
//         destructive: {
//           DEFAULT: 'hsl(var(--destructive))',
//           foreground: 'hsl(var(--destructive-foreground))',
//         },
//         border: 'hsl(var(--border))',
//         input: 'hsl(var(--input))',
//         ring: 'hsl(var(--ring))',
//         chart: {
//           '1': 'hsl(var(--chart-1))',
//           '2': 'hsl(var(--chart-2))',
//           '3': 'hsl(var(--chart-3))',
//           '4': 'hsl(var(--chart-4))',
//           '5': 'hsl(var(--chart-5))',
//         },
//       },
//     },
//   },
//   plugins: [tailwindcssAnimate],
// }
