import type { Config } from 'tailwindcss'
import { colors } from '@velocitylabs-org/turtle-tailwind-config'
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette')

const prefix = 'turtle'

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
      fontFamily: {
        dazzed: ['var(--font-dazzed)'],
      },
      fontSize: {
        'section-title': '2rem',
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
