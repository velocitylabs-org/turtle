import { nextui } from '@nextui-org/react'
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
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: colors,
      // TODO fonts will be adjusted once design is finalized
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    addVariablesForColors,
    nextui({
      layout: {
        radius: {
          small: '0.5rem',
          medium: '0.5rem',
          large: '0.5rem',
        },
      },
    }),
  ],
}
export default config

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme('colors'))
  let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]))

  addBase({
    ':root': newVars,
  })
}
