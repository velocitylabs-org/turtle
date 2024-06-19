'use client'
import { FC } from 'react'
import OngoingTransfer from './OngoingTransfer'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'
import { Network } from '../models/chain'

const OngoingTransfers: FC = () => {
  const { transfers, addTransfer, removeTransfer } = useOngoingTransfers()

  const handleViewCompleted = () => {
    // TODO(nuno)
  }

  return (
    <div className="mt-20">
      <div className="self-center text-center text-3xl tracking-tight text-black">In Progress</div>
      {transfers.map(tx => (
        <OngoingTransfer
          key={tx.id}
          id={tx.id}
          sender={tx.sender}
          token={tx.token}
          sourceChain={tx.sourceChain}
          destChain={tx.destChain}
          amount={tx.amount}
          recipient={tx.recipient}
          status={tx.status}
          date={tx.date}
        />
      ))}

      <button
        onClick={handleViewCompleted}
        className="w-full rounded-lg border border-gray-300 bg-white py-2 text-center text-lg text-gray-700 hover:bg-gray-100"
      >
        View completed transactions <i className="fas fa-arrow-right ml-1"></i>
      </button>
    </div>
  )
}

export default OngoingTransfers
