import { isEVMWallet, isSubstrateWallet, Wallet } from '@/models/wallet'
import { useAccount } from 'wagmi'

const useWalletAddress = (wallet?: Wallet): string | undefined => {
  const { address: evmAddress } = useAccount()
  const substrateAddress = 'placeholder' // TODO: Placeholder for Substrate wallet address. Integrate hook/store here.

  if (!wallet) return

  if (isSubstrateWallet(wallet)) return substrateAddress
  if (isEVMWallet(wallet)) return evmAddress

  return
}

export default useWalletAddress
