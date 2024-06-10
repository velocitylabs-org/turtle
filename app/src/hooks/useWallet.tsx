import useSubstrateWallet from './useSubstrateWallet'
import useEvmWallet from '@/hooks/useEvmWallet'
import { Chain, Network } from '@/models/chain'
import { Sender } from './useTransfer'

const useWallet = (chain: Chain | null): Sender | undefined => {
  const evmWallet = useEvmWallet()
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
