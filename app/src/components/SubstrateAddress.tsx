import { truncateAddress } from '@/utils/address'
import Identicon from '@polkadot/react-identicon'
import React, { FC } from 'react'

interface SubstrateAddressProps {
  /** The Address to display. */
  substrateAddress: string
}

const SubstrateAddress: FC<SubstrateAddressProps> = ({ substrateAddress }) => {
  // Prevents click event propagation
  const handleIdenticonClick = (event: React.MouseEvent) => {
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

export default SubstrateAddress
