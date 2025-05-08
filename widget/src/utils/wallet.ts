import DefaultWalletLogo from '@/assets/svg/wallet.svg'
import FearlessLogo from '@/assets/wallets-logo/fearless.svg'
import NovaWalletLogo from '@/assets/wallets-logo/novawallet.svg'
import PolkadotLogo from '@/assets/wallets-logo/polkadotjs.svg'
import SubwalletLogo from '@/assets/wallets-logo/subwallet.svg'
import TalismanLogo from '@/assets/wallets-logo/talisman.svg'

type Wallet = 'talisman' | 'subwallet-js' | 'polkadot-js' | 'fearless-wallet'

interface WalletConfig {
  displayName: string
  logo: string
  weight: number
}

const WALLET_CONFIGS: Record<Wallet, WalletConfig> = {
  talisman: {
    displayName: 'Talisman',
    logo: TalismanLogo,
    weight: 1,
  },
  'subwallet-js': {
    displayName: 'SubWallet',
    logo: SubwalletLogo,
    weight: 2,
  },
  'polkadot-js': {
    displayName: 'Polkadot.js',
    logo: PolkadotLogo,
    weight: 3,
  },
  'fearless-wallet': {
    displayName: 'Fearless Wallet',
    logo: FearlessLogo,
    weight: 4,
  },
}

export const capitalizeFirstLetter = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

const isNovaWallet = (window?: Window): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window && (window as any).walletExtension?.isNovaWallet === true)
}

export const getWalletName = (name: Wallet | string, window?: Window): string => {
  if (name === 'polkadot-js' && isNovaWallet(window)) return 'Nova Wallet'

  return WALLET_CONFIGS[name as Wallet]?.displayName ?? capitalizeFirstLetter(name)
}

export const getWalletLogo = (name: Wallet | string, window?: Window): string => {
  if (name === 'polkadot-js' && isNovaWallet(window)) return NovaWalletLogo

  return WALLET_CONFIGS[name as Wallet]?.logo ?? DefaultWalletLogo
}

/**
 * Get the weight of a wallet which used to sort the wallets deterministically.
 * @param name - The extension name of the wallet.
 * @returns The weight of the wallet.
 */
export const getWalletWeight = (name: Wallet | string, window?: Window): number => {
  if (name === 'polkadot-js' && isNovaWallet(window)) return 1

  return WALLET_CONFIGS[name as Wallet]?.weight ?? 5
}
