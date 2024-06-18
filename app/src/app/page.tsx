import Transfer from '@/components/Transfer'
import { Background } from '@/components/svg/WavesBackground'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center p-1 sm:p-5">
      <Background />
      <div className="relative z-10">
        <Transfer />
      </div>
    </div>
  )
}

export default App
