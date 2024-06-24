'use client'
import { Transfer } from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { truncateAddress } from '@/utils/address'
import { formatDate, toHuman } from '@/utils/transfer'
import { FC, useEffect, useState } from 'react'
import * as Snowbridge from '@snowbridge/api'

const OngoingTransfer: FC<{ transfer: Transfer }> = ({ transfer }) => {
  const [update, setUpdate] = useState<string | null>('Loading...')
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)

  useEffect(() => {
    const pollUpdate = async () => {
      try {
        if (direction == Direction.ToEthereum) {
          await trackToEthereum(transfer, setUpdate)
        } else if (direction == Direction.ToPolkadot) {
          await trackToPolkadot(transfer, setUpdate)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    pollUpdate()
  }, [])

  return (
    <div className="mb-2 rounded-[16px] border border-turtle-level3 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold text-purple-600 text-turtle-secondary-dark">{update}</p>
        <p className="text-normal text-turtle-secondary">{formatDate(transfer.date)}</p>
      </div>
      {/* Progress bar */}
      <div className="mb-4 h-2 rounded-full bg-turtle-secondary-light">
        <div
          className="h-2 rounded-full border border-turtle-secondary-dark bg-turtle-secondary"
          style={{ width: '60%' }}
        ></div>
      </div>
      <div className="mb-2 flex items-center">
        <i className="fas fa-sync-alt mr-3 animate-[spin_3s_infinite] text-lg font-light text-turtle-secondary"></i>
        <p className="text-turtle-foreground)] text-xl font-normal">
          {toHuman(transfer.amount, transfer.token)} {transfer.token.symbol}
        </p>
        {/* From and to Chains */}
        <div className="ml-2 flex h-[24px] items-center rounded-full border border-turtle-level3 p-1">
          <img
            src={transfer.sourceChain.logoURI}
            alt="Source Chain"
            className="h-[16px] rounded-full border border-turtle-secondary-dark"
          />
          <i className="fas fa-arrow-right p-1.5 text-xs text-turtle-secondary-dark"></i>
          <img
            src={transfer.destChain.logoURI}
            alt="Destination Chain"
            className="h-[16px] w-4 rounded-full border border-turtle-secondary-dark"
          />
        </div>
      </div>
      <div className="flex items-center">
        <img
          src="https://placehold.co/16x16"
          alt="User avatar"
          className="mr-1 h-[16px] rounded-full border border-turtle-secondary-dark"
        />
        <p className="text-turtle-foreground)]">{truncateAddress(transfer.sender, 4, 4)}</p>
        <i className="fas fa-arrow-right mx-2 p-1.5 text-lg text-turtle-secondary-dark"></i>
        <img
          src="https://placehold.co/16x16"
          alt="User avatar"
          className="mr-1 h-[16px] rounded-full border border-turtle-secondary-dark"
        />
        <p className="text-turtle-foreground)]">{truncateAddress(transfer.recipient, 4, 4)}</p>
      </div>
    </div>
  )
}

export default OngoingTransfer

const POLL_UPDATE_INTERVAL_MS: number = 10_000

async function trackToPolkadot(transfer: Transfer, setUpdate: (x: string) => void) {
  while (true) {
    const { status, result } = await Snowbridge.toPolkadot.trackSendProgressPolling(
      transfer.context,
      transfer.sendResult as Snowbridge.toPolkadot.SendResult,
    )

    if (status != 'pending') {
      setUpdate('Done!')
      //TODO(nuno): remove tx from ongoing and move it to completed
      break
    }

    // Pending, keep track of progress
    const { success } = result

    if (result.failure || !success || !success.plan.success) {
      setUpdate('This transfer failed!')
      break
    }

    if (!!success.destinationParachain?.events) {
      setUpdate(`Arriving at ${transfer.destChain.name}..."`)
    } else if (!!success.bridgeHub.events) {
      setUpdate('Arriving at BridgeHub...')
    } else if (!!success.assetHub.events) {
      setUpdate('Arriving at AssetHub...')
    } else if (!!success.ethereum.events) {
      setUpdate('Bridging in progress..')
    } else {
      setUpdate('Loading...')
    }
  }

  await new Promise(r => setTimeout(r, POLL_UPDATE_INTERVAL_MS))
}

async function trackToEthereum(transfer: Transfer, setUpdate: (x: string) => void) {
  while (true) {
    const { status, result } = await Snowbridge.toEthereum.trackSendProgressPolling(
      transfer.context,
      transfer.sendResult as Snowbridge.toEthereum.SendResult,
    )

    if (status != 'pending') {
      setUpdate('Done!')
      //TODO(nuno): remove tx from ongoing and move it to completed
      break
    }

    // Pending, keep track of progress
    const { success } = result

    //TODO(nuno): This shouldn't really happen but we should handle this better
    if (result.failure || !success || !success.plan.success) {
      setUpdate('This transfer failed!')
      break
    }

    if (!!success.sourceParachain?.events) {
      setUpdate('Sending...')
    } else if (!!success.assetHub.events) {
      setUpdate('Arriving at AssetHub...')
    } else if (!!success.bridgeHub.events) {
      setUpdate('Arriving at BridgeHub...')
    } else {
      setUpdate('Bridging in progress...')
    }

    await new Promise(r => setTimeout(r, POLL_UPDATE_INTERVAL_MS))
  }
}
