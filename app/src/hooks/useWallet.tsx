import useSubstrateWallet from './useSubstrateWallet'
import useEthersSigner from '@/context/ethers'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { JsonRpcSigner } from 'ethers'
import { Chain, Network } from '@/models/chain'

const useWallet = (chain: Chain | null): SubstrateAccount | JsonRpcSigner | undefined => {
  const evmWallet = useEthersSigner()
  const { substrateAccount, setSubstrateAccount } = useSubstrateWallet()

  if (!chain) return

  switch (chain.network) {
    case Network.Ethereum:
      return evmWallet
    case Network.Polkadot:
      return substrateAccount ?? undefined
  }
}

export default useWallet
