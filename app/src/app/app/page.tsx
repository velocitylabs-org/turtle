import AppHeader from '@/components/AppHeader'
import TransferPage from '@/components/TransferPage'
import { BackgroundBeams } from '@/components/ui/Background'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <AppHeader />
      <BackgroundBeams />
      <TransferPage />
    </div>
  )
}

export default App
