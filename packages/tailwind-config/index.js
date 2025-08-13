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

export default {
  theme: {
    extend: {
      colors,
      fontSize: {
        'large-heading': 'clamp(3.5rem, 2.4966rem + 4.5872vw, 6.625rem)',
      },
      backgroundColor: {
        'btn-disabled': colors[`${prefix}-primary`],
        'dialog-overlay': 'rgba(var(--turtle-dialog-overlay-rgb), var(--turtle-dialog-overlay-opacity))',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
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
    },
  },
}
