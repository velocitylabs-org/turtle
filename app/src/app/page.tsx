import Navbar from '@/components/NavBar'
import Transfer from '@/components/Transfer'
import { BackgroundBeams } from '@/components/ui/Background'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <Transfer />
    </div>
  )
}

export default App
