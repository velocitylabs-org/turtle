import useEvmWallet from '@/hooks/useEvmWallet'
import { Network } from '@/models/chain'
import useSubstrateWallet from './useSubstrateWallet'
import { Sender } from './useTransfer'

const useWallet = (network?: Network): Sender | undefined => {
  const evmWallet = useEvmWallet()
  const { substrateAccount, setSubstrateAccount } = useSubstrateWallet()

  if (!network) return

  switch (network) {
    case Network.Ethereum:
      return evmWallet
    case Network.Polkadot:
      return substrateAccount ?? undefined
  }
}

export default useWallet
