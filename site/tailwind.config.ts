import type { Config } from 'tailwindcss'
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette')

const prefix = 'turtle'

export const colors = {
  [`${prefix}-primary`]: '#00FF29',
  [`${prefix}-primary-dark`]: '#008115',
  [`${prefix}-primary-light`]: '#D9FFDF',

  [`${prefix}-secondary`]: '#A184DC',
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

  [`${prefix}-error`]: '#ef2828',
  [`${prefix}-error-dark`]: '#8D1269',
  [`${prefix}-error-light`]: '#FFE1F6',
}

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: colors,
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        dazzed: ['var(--font-dazzed)'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontSize: {
        logo: '2rem',
        'h-sub': '3.5rem',
        'hero-xl': '6.625rem',
      },
      lineHeight: {
        '12': '3.5rem',
      },
      letterSpacing: {
        xs: '0.04em',
        sm: '0.03em',
      },
      screens: {
        '3xl': '1730px',
        '4xl': '2100px',
      },
    },
  },

  plugins: [require('daisyui'), addVariablesForColors],
  daisyui: {
    themes: [
      {
        turtleTheme: {
          primary: colors[`${prefix}-primary`],
          secondary: colors[`${prefix}-secondary`],
          accent: colors[`${prefix}-tertiary-dark`],

          neutral: colors[`${prefix}-foreground`],
          'base-100': colors[`${prefix}-background`],

          info: colors[`${prefix}-tertiary`],
          success: colors[`${prefix}-success`],
          warning: colors[`${prefix}-warning`],
          error: colors[`${prefix}-error`],
        },
      },
    ],

    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
}
export default config

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme('colors'))
  let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]))

  addBase({
    ':root': newVars,
  })
}
