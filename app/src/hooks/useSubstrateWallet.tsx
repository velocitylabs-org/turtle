import { web3FromSource } from '@talismn/connect-components'

const useSubstrateWallet = () => {
  const getSigner = () => {
    const injector = web3FromSource()
    return injector.signer
  }

  return { getSigner }
}

export default useSubstrateWallet
