import { truncateAddress } from '@/utils/address'
import Identicon from '@polkadot/react-identicon'
import { MouseEvent } from 'react'

interface SubstrateAddressProps {
  /** The Address to display. */
  substrateAddress: string
}

export default function SubstrateAddress({ substrateAddress }: SubstrateAddressProps) {
  // Prevents click event propagation
  const handleIdenticonClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <div className="flex items-center gap-2">
      <div onClick={handleIdenticonClick}>
        <Identicon value={substrateAddress} size={20} theme="polkadot" />
      </div>
      <p>{truncateAddress(substrateAddress)}</p>
    </div>
  )
}
