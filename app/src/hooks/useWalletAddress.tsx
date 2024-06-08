import { isEVMWallet, isSubstrateWallet, Wallet } from '@/models/wallet'
import { useAccount } from 'wagmi'
import useSubstrateWallet from './useSubstrateWallet'

const useWalletAddress = (wallet?: Wallet): string | undefined => {
  const { address: evmAddress } = useAccount()
  const { substrateAccount, setSubstrateAccount } = useSubstrateWallet()

  if (!wallet) return

  if (isSubstrateWallet(wallet)) return substrateAccount?.address
  if (isEVMWallet(wallet)) return evmAddress

  return
}

export default useWalletAddress
