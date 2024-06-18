'use client'
import { FC } from 'react'
import OngoingTransfer from './OngoingTransfer'
import OngoingTransferModal from './OngoingTransferModal'

const OngoingTransfers: FC = () => {
  return (
    <div className="mt-20">
      <div className="self-center text-center text-3xl tracking-tight text-black">In Progress</div>
      <OngoingTransfer token="USDC" />
    </div>
  )
}

export default OngoingTransfers
