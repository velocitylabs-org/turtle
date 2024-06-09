import { WalletType } from '@/models/wallet'
import useSubstrateWallet from './useSubstrateWallet'
import useEthersSigner from '@/context/ethers'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { JsonRpcSigner } from 'ethers'

const useWallet = (wallet?: WalletType): SubstrateAccount | JsonRpcSigner | undefined => {
  const evmWallet = useEthersSigner()
  const { substrateAccount, setSubstrateAccount } = useSubstrateWallet()

  if (!wallet) return

  if (wallet == WalletType.Substrate) return substrateAccount ? substrateAccount : undefined
  if (wallet == WalletType.EVM) return evmWallet

  return
}

export default useWallet
