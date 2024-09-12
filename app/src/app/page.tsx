import { FC } from 'react'

import { HomeComponentSelect } from '@/components/HomeComponentSelect'
import { TurtlesBackground } from '@/components/TurtlesBackground'
// WIP - TEST
// import { getEnvironment } from '@/context/snowbridge'
// import { shouldUseTestnet } from '@/utils/env'
// import { trackAhToEthTransfer, trackXcmTransfer } from '@/utils/subscan'
// import { Environment } from '@/store/environmentStore'

const App: FC = async () => {
  // const env = getEnvironment(shouldUseTestnet ? Environment.Testnet : Environment.Mainnet)
  // const txHash = '0xa42fd8668a51cddec85dca40d9cbb6e7c40424f32d8f99edc167c887a38c3d99'
  // const ahToEthTransfer = await trackAhToEthTransfer(env, txHash)
  // console.log('trackAhToEthTransfer', ahToEthTransfer)
  // const xcmTransfer = await trackXcmTransfer(env, txHash)
  // console.log('xcmTransfer', xcmTransfer)

  return (
    <main>
      <TurtlesBackground />
      <section className="z-10 mt-10 flex flex-col items-center justify-center gap-8 sm:mt-6 sm:p-5">
        <HomeComponentSelect />
      </section>
    </main>
  )
}

export default App
