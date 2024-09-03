import { FC } from 'react'

import { HomeComponentSelect } from '@/components/HomeComponentSelect'
import { TurtlesBackground } from '@/components/TurtlesBackground'
import { getEnvironment } from '@/context/snowbridge'
import { shouldUseTestnet } from '@/utils/env'
// WIP - TEST
import { getAhToParachainHistory } from '@/utils/subscan'
import { Environment } from '@/store/environmentStore'

const App: FC = async () => {
  const env = getEnvironment(shouldUseTestnet ? Environment.Testnet : Environment.Mainnet)
  const txHash = '0xcdefd199b2b88c8ae43130dd4e48d8a5d3407556edfa617dba259bd51505a588'
  const data = await getAhToParachainHistory(env, txHash)
  console.log('AhToParachainHistory', data)

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
