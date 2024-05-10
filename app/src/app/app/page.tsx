import TransferPage from '@/components/TransferPage'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <p className="pb-5 text-8xl">🐢</p>
      <p className="pb-8 text-4xl font-bold">Turtle Transfer </p>
      <TransferPage />
    </div>
  )
}

export default App
