import Menu from '@/components/Menu'
import Transfer from '@/components/Transfer'
import { Background } from '@/components/svg/WavesBackground'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 p-1 sm:p-5">
      <Menu />
      <Transfer />
    </div>
  )
}

export default App
