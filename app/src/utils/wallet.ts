import { Chain } from '@/models/chain'
import { Wallet, WalletType } from '@/models/wallet'

/**
 * Determines the wallet based on the provided blockchain chain. Currently supports Ethereum and Substrate.
 *
 * @param chain - The blockchain you want a wallet for
 * @returns The corresponding Wallet for the given chain.
 */
// TODO implement real logic
export const chainToWallet = (chain: Chain): Wallet => {
  if (chain.name === 'Ethereum') return { type: WalletType.EVM }
  else return { type: WalletType.Substrate }
}
