import OngoingTransfers from '@/components/OngoingTransfers'
import Menu from '@/components/Menu'
import Transfer from '@/components/Transfer'
import { FC } from 'react'

const App: FC = async () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 p-1 sm:p-5">
      <Menu />
      <Transfer />
      <OngoingTransfers />
    </div>
  )
}

export default App
