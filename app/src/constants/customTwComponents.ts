import plugin from 'tailwindcss/plugin'

const buttonPrimaryStyle = {
  '@apply btn btn-primary border border-black hover:border-black focus:border-black active:border-black disabled:border-black disabled:bg-turtle-primary disabled:bg-opacity-30':
    {},
}

const buttonSecondaryStyle = {
  '@apply btn bg-turtle-level3 hover:bg-turtle-level4 disabled:bg-turtle-level3 disabled:bg-opacity-30':
    {},
}

const buttonOutlinedStyle = {
  '@apply btn btn-ghost border-turtle-level3 hover:border-turtle-level3 hover:bg-turtle-level1 disabled:border-turtle-level3 disabled:border-opacity-30 disabled:bg-white disabled:bg-opacity-30':
    {},
}

const buttonGhostStyle = {
  '@apply btn btn-ghost hover:bg-turtle-level2 disabled:bg-white': {},
}

const customComponents = plugin(function ({ addComponents }) {
  addComponents({
    // Primary buttons
    '.btn-turtle-primary-lg': {
      ...buttonPrimaryStyle,
      '@apply btn-md': {},
    },

    '.btn-turtle-primary-md': {
      ...buttonPrimaryStyle,
      '@apply btn-sm': {},
    },

    '.btn-turtle-primary-sm': {
      ...buttonPrimaryStyle,
      '@apply btn-xs': {},
    },

    // Secondary buttons
    '.btn-turtle-secondary-lg': {
      ...buttonSecondaryStyle,
      '@apply btn-md': {},
    },

    '.btn-turtle-secondary-md': {
      ...buttonSecondaryStyle,
      '@apply btn-sm': {},
    },

    '.btn-turtle-secondary-sm': {
      ...buttonSecondaryStyle,
      '@apply btn-xs': {},
    },

    // Outlined buttons
    '.btn-turtle-outlined-lg': {
      ...buttonOutlinedStyle,
      '@apply btn-md': {},
    },

    '.btn-turtle-outlined-md': {
      ...buttonOutlinedStyle,
      '@apply btn-sm': {},
    },

    '.btn-turtle-outlined-sm': {
      ...buttonOutlinedStyle,
      '@apply btn-xs': {},
    },

    // Ghost buttons
    '.btn-turtle-ghost-lg': {
      ...buttonGhostStyle,
      '@apply btn-md': {},
    },

    '.btn-turtle-ghost-md': {
      ...buttonGhostStyle,
      '@apply btn-sm': {},
    },

    '.btn-turtle-ghost-sm': {
      ...buttonGhostStyle,
      '@apply btn-xs': {},
    },
  })
})

export default customComponents
