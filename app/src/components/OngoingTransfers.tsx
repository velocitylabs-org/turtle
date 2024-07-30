'use client'

import { useEffect, useState } from 'react'

import useStore from '@/hooks/useStore'
import { DisplaysTransfers, TransferTab } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'

import OngoingTransferDialog from './OngoingTransferDialog'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { getSnowBridgeStatus } from '@/context/snowbridge'

const OngoingTransfers = ({
  newTransferInit,
  setNewTransferInit,
  hasCompletedTransfers,
}: DisplaysTransfers) => {
  const ongoingTransfers = useStore(useOngoingTransfersStore, state => state.transfers)
  const [bridgeStatus, setBridgeStatus] = useState<SnowbridgeStatus | null>(null)

  const DEFAULT_AVERAGE_BRIDGE_EXECUTION = 30 // minutes

  const getBridgeStatus = async () => {
    try {
      setBridgeStatus(await getSnowBridgeStatus())
    } catch (error) {
      const status = {
        ethBridgeStatus: DEFAULT_AVERAGE_BRIDGE_EXECUTION * 60, // converted to seconds
        polkadotBridgeStatus: DEFAULT_AVERAGE_BRIDGE_EXECUTION * 60, // converted to seconds
      }
      setBridgeStatus(status)
      console.log('Set bridge status error: ', error)
    }
  }

  useEffect(() => {
    let shouldUpdate = true
    shouldUpdate && getBridgeStatus()

    return () => {
      shouldUpdate = false
    }
  }, [ongoingTransfers])

  return (
    <div>
      {ongoingTransfers && ongoingTransfers.length > 0 && (
        <div className="my-20">
          <div className="self-center text-center text-3xl tracking-tight text-black">
            In Progress
          </div>
          <div className="mt-8 flex w-full flex-col gap-2 rounded-[24px] bg-white p-[2.5rem] px-[1.5rem] py-[2rem] shadow-[0_2px_16px_0px_#00000026] sm:p-[2.5rem]">
            {ongoingTransfers.map(tx => (
              <OngoingTransferDialog key={tx.id} transfer={tx} bridgeStatus={bridgeStatus} />
            ))}

            {hasCompletedTransfers && (
              <button
                onClick={() =>
                  newTransferInit === TransferTab.New && setNewTransferInit(TransferTab.Completed)
                }
                disabled={!hasCompletedTransfers}
                className="text-turtle-foreground)] w-full rounded-[8px] border border-turtle-level3 py-[8px] text-center text-lg"
              >
                View completed transactions <i className="fas fa-arrow-right ml-1"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OngoingTransfers
