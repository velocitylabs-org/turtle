import plugin from 'tailwindcss/plugin'

const customComponents = plugin(function ({ addComponents }) {
  addComponents({
    '.btn-turtle-primary': {
      '@apply btn-primary border border-black hover:border-black focus:border-black active:border-black disabled:border-black disabled:bg-turtle-primary disabled:bg-opacity-30':
        {},
    },
  })
})

export default customComponents
