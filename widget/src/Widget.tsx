import WalletButton from './components/WalletButton'
import useWallet from './hooks/useWallet'
import { truncateAddress } from './utils/address'

export interface WidgetProps {
  title?: string
}

const Widget: React.FC<WidgetProps> = ({ title = 'Transfers Widget' }) => {
  const sourceWallet = useWallet('SubstrateEVM')
  return (
    <div className="bg-card m-4 mx-auto max-w-sm rounded-lg p-6 text-center shadow-md">
      <h2 className="text-card-foreground mb-4 text-2xl font-bold">{title}</h2>
      <div>
        {sourceWallet?.sender?.address && truncateAddress(sourceWallet?.sender?.address, 10)}
      </div>
      <div className="space-x-2">
        <WalletButton walletType="SubstrateEVM" />
      </div>
    </div>
  )
}

export default Widget
