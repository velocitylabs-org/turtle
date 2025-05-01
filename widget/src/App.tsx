import SubstrateWalletModal from './components/SubstrateWalletModal'
import Widget from '@/components/Widget'
import { Providers } from './providers'

function App() {
  return (
    <Providers>
      <Widget />
      <SubstrateWalletModal />
    </Providers>
  )
}

export default App
