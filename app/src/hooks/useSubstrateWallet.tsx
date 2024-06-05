import { useSubstrateWalletStore } from '@/store/substrateWalletStore'

const useSubstrateWallet = () => {
  const state = useSubstrateWalletStore.getState()

  return { account: state.account, setAccount: state.setAccount }
}

export default useSubstrateWallet
