export const capitalizeFirstLetter = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const getWalletName = (name: string): string => {
  switch (name) {
    case 'talisman':
      return 'Talisman'

    case 'subwallet-js':
      return 'SubWallet'

    case 'polkadot-js':
      return 'Polkadot.js'

    case 'fearless-wallet':
      return 'Fearless Wallet'

    default:
      return capitalizeFirstLetter(name)
  }
}

export const getWalletLogo = (name: string): string => {
  switch (name) {
    case 'talisman':
      return '/talisman.svg'

    case 'subwallet-js':
      return '/subwallet.svg'

    case 'polkadot-js':
      return '/polkadotjs.svg'

    case 'fearless-wallet':
      return '/fearless.svg'

    default:
      return '/wallet.svg'
  }
}
