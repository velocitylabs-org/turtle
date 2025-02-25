import { Widget } from './Widget'
import SubstrateWalletModal from './components/SubstrateWalletModal'
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
