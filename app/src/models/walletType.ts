import { Chain } from './chain'

export enum WalletType {
  EVM = 'evm',
  SUBSTRATE = 'substrate',
}

// TODO implement real logic
/**
 * Determines the wallet type based on the provided blockchain chain. Currently supports Ethereum and Substrate.
 *
 * @param chain - The blockchain you want a wallet type for
 * @returns The corresponding WalletType for the given chain.
 */
export const chainToWalletType = (chain: Chain): WalletType => {
  if (chain.name === 'Ethereum') return WalletType.EVM
  else return WalletType.SUBSTRATE
}
