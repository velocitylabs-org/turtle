import { FC } from 'react'

import { HomeComponentSelect } from '@/components/HomeComponentSelect'
import { TurtlesBackground } from '@/components/TurtlesBackground'
import { getEnvironment } from '@/context/snowbridge'
import { shouldUseTestnet } from '@/utils/env'
// WIP - TEST
import { getHistoryTest } from '@/utils/subscan'
import { Environment } from '@/store/environmentStore'

const App: FC = async () => {
  const env = getEnvironment(shouldUseTestnet ? Environment.Testnet : Environment.Mainnet)
  console.log(await getHistoryTest(env))

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
