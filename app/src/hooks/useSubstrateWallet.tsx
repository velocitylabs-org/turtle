import { useSubstrateWalletStore } from '@/store/substrateWalletStore'

const useSubstrateWallet = () => {
  const account = useSubstrateWalletStore(state => state.account)
  const setAccount = useSubstrateWalletStore(state => state.setAccount)

  return { account, setAccount }
}

export default useSubstrateWallet
