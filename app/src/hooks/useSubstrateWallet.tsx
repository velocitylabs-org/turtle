import { useSubstrateWalletStore } from '@/store/substrateWalletStore'

const useSubstrateWallet = () => {
  const substrateAccount = useSubstrateWalletStore(state => state.account)
  const setSubstrateAccount = useSubstrateWalletStore(state => state.setAccount)

  return { substrateAccount, setSubstrateAccount }
}

export default useSubstrateWallet
