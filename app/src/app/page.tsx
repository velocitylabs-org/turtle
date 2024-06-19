import Transfer from '@/components/Transfer'
import { Background } from '@/components/svg/WavesBackground'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-1 sm:p-5">
      <Transfer />
    </div>
  )
}

export default App
