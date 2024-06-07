import Transfer from '@/components/Transfer'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-5">
      <Transfer />
    </div>
  )
}

export default App
