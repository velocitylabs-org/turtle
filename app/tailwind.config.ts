import type { Config } from 'tailwindcss'
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette')

// TODO colors will be adjusted once design is finalized
export const colors = {
  primary: '#88ef28',
  'primary-content': '#0c1602',
  'primary-dark': '#6fd410',
  'primary-light': '#a2f357',

  secondary: '#8f28ef',
  'secondary-content': '#ffffff',
  'secondary-dark': '#7510d4',
  'secondary-light': '#a857f3',

  background: '#191b18',
  foreground: '#262923',
  border: '#40453b',

  copy: '#fbfbfb',
  'copy-light': '#d9dcd6',
  'copy-lighter': '#a6ac9f',

  success: '#28ef28',
  warning: '#efef28',
  error: '#ef2828',

  'success-content': '#021602',
  'warning-content': '#161602',
  'error-content': '#ffffff',
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
      // TODO fonts will be adjusted once design is finalized
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },

  plugins: [require('daisyui'), addVariablesForColors],
  daisyui: {
    themes: [
      {
        turtle: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors['primary-light'],
          neutral: colors.foreground,
          'base-100': colors.background,
        },
      },
    ],

    darkTheme: 'turtle', // name of one of the included themes for dark mode
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
