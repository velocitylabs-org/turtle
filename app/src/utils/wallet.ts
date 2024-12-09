export const capitalizeFirstLetter = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

const isNovaWallet = (window?: Window): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window && (window as any).walletExtension?.isNovaWallet === true)
}

export const getWalletName = (name: string, window?: Window): string => {
  switch (name) {
    case 'talisman':
      return 'Talisman'

    case 'subwallet-js':
      return 'SubWallet'

    case 'polkadot-js': {
      if (isNovaWallet(window)) return 'Nova Wallet'
      return 'Polkadot.js'
    }

    case 'fearless-wallet':
      return 'Fearless Wallet'

    default:
      return capitalizeFirstLetter(name)
  }
}

export const getWalletLogo = (name: string, window?: Window): string => {
  switch (name) {
    case 'talisman':
      return '/logos/talisman.svg'

    case 'subwallet-js':
      return '/logos/subwallet.svg'

    case 'polkadot-js': {
      if (isNovaWallet(window)) return '/logos/novawallet.svg'
      return '/logos/polkadotjs.svg'
    }

    case 'fearless-wallet':
      return '/logos/fearless.svg'

    default:
      return '/wallet.svg'
  }
}
