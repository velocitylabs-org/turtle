import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { Signer } from 'ethers'
import { Chain } from './chain'

export enum WalletType {
  Substrate = 'substrate',
  EVM = 'evm',
}

export type SubstrateWallet = {
  type: WalletType.Substrate
  wallet?: SubstrateAccount | null
}

export type EVMWallet = {
  type: WalletType.EVM
  wallet?: Signer | null
}

// Type that gathers all supported types of wallets
export type Wallet = SubstrateWallet | EVMWallet

// Type guard for SubstrateWallet
export const isSubstrateWallet = (wallet: Wallet): wallet is SubstrateWallet => {
  return wallet.type === WalletType.Substrate
}

// Type guard for EVMWallet
export const isEVMWallet = (wallet: Wallet): wallet is EVMWallet => {
  return wallet.type === WalletType.EVM
}

/**
 * Determines the wallet type based on the provided blockchain chain. Currently supports Ethereum and Substrate.
 *
 * @param chain - The blockchain you want a wallet for
 * @returns The corresponding WalletType for the given chain.
 */
// TODO implement real logic
export const chainToWalletType = (chain: Chain): WalletType => {
  if (chain.name === 'Ethereum') return WalletType.EVM
  else return WalletType.Substrate
}

export const walletFromChain = (
  chain: Chain,
  evmWallet?: Signer,
  substrateWallet?: SubstrateAccount | null,
): Wallet => {
  console.log('wslletFromChain: ', chain, substrateWallet)
  switch (chainToWalletType(chain)) {
    case WalletType.EVM:
      return { type: WalletType.EVM, wallet: evmWallet }
    case WalletType.Substrate:
      return { type: WalletType.Substrate, wallet: substrateWallet }
  }
}
