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
      return './src/assets/wallets-logo/talisman.svg'

    case 'subwallet-js':
      return './src/assets/wallets-logo/subwallet.svg'

    case 'polkadot-js': {
      if (isNovaWallet(window)) return './src/assets/wallets-logo/novawallet.svg'
      return './src/assets/wallets-logo/polkadotjs.svg'
    }

    case 'fearless-wallet':
      return './src/assets/wallets-logo/fearless.svg'

    default:
      return './src/assets/svg/wallet.svg'
  }
}
