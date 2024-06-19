'use client'
import { FC } from 'react'
import OngoingTransfer from './OngoingTransfer'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'
import { Network } from '../models/chain'

const OngoingTransfers: FC = () => {
  const { ongoingTransfers } = useOngoingTransfers()

  const handleViewCompleted = () => {
    // TODO(nuno)
  }

  //   box-shadow: 0px 2px 16px 0px #00000026;
  // shadow-[0_2px_16px_0px_#00000026]">

  return (
    <div>
      {ongoingTransfers.length > 0 && (
        <div className="mt-20">
          <div className="self-center text-center text-3xl tracking-tight text-black">
            In Progress
          </div>
          <div className="mt-8 flex w-full flex-col gap-2 rounded-[24px] bg-white p-[2.5rem] shadow-[0_2px_16px_0px_#00000026] sm:min-w-[31.5rem]">
            {ongoingTransfers.map(tx => (
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
              className="mt-1 w-full rounded-[8px] border border-[color:var(--turtle-level3)] py-[8px] text-center text-lg text-xl text-[color:var(--turtle-foreground)]"
            >
              View completed transactions <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OngoingTransfers
