import Menu from '@/components/Menu'
import Transfer from '@/components/Transfer'
import { TurtlesBackground } from '@/components/TurtlesBackground'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="z-10 flex flex-col items-center justify-center gap-8 p-1 sm:p-5">
      <TurtlesBackground
        src={'/turtle-background.svg'}
        alt={'Frictionless cross-chain transfers'}
      />
      <Menu />
      <Transfer />
    </div>
  )
}

export default App
