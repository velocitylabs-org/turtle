import DefaultWalletLogo from '@/assets/svg/wallet.svg'
import FearlessLogo from '@/assets/wallets-logo/fearless.svg'
import NovaWalletLogo from '@/assets/wallets-logo/novawallet.svg'
import PolkadotLogo from '@/assets/wallets-logo/polkadotjs.svg'
import SubwalletLogo from '@/assets/wallets-logo/subwallet.svg'
import TalismanLogo from '@/assets/wallets-logo/talisman.svg'

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
      return TalismanLogo

    case 'subwallet-js':
      return SubwalletLogo

    case 'polkadot-js': {
      if (isNovaWallet(window)) return NovaWalletLogo
      return PolkadotLogo
    }

    case 'fearless-wallet':
      return FearlessLogo

    default:
      return DefaultWalletLogo
  }
}
