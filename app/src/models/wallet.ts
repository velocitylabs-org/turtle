export enum WalletType {
  Substrate = 'substrate',
  EVM = 'evm',
}

export type SubstrateWallet = {
  type: WalletType.Substrate
  /// other fields or wrap another standard wallet type
}

export type EVMWallet = {
  type: WalletType.EVM
  /// other fields or wrap another standard wallet type
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
