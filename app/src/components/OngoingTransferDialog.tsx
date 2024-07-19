'use client'

import Identicon from '@polkadot/react-identicon'
import * as Snowbridge from '@snowbridge/api'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { getContext, getEnvironment } from '@/context/snowbridge'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import useLookupName from '@/hooks/useLookupName'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'
import { Network } from '@/models/chain'
import { CompletedTransfer, StoredTransfer, TxStatus } from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { truncateAddress } from '@/utils/address'
import { feeToHuman, formatDate, toHuman } from '@/utils/transfer'

import OngoingTransfer from './OngoingTransfer'
import { ArrowRight } from './svg/ArrowRight'
import { ArrowUpRight } from './svg/ArrowUpRight'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Separator } from './ui/separator'

import { colors } from '../../tailwind.config'

export const OngoingTransferDialog = ({ transfer }: { transfer: StoredTransfer }) => {
  const { removeTransfer: removeOngoingTransfer } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const senderName = useLookupName(transfer.sourceChain.network, transfer.sender)
  const recipientName = useLookupName(transfer.destChain.network, transfer.recipient)

  const [update, setUpdate] = useState<string | null>('Loading...')

  const senderDisplay = senderName ? senderName : truncateAddress(transfer.sender, 4, 4)
  const recipientDisplay = recipientName ? recipientName : truncateAddress(transfer.recipient, 4, 4)
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)

  useEffect(() => {
    const pollUpdate = async () => {
      try {
        if (direction == Direction.ToEthereum) {
          await trackToEthereum(transfer, setUpdate, removeOngoingTransfer, addCompletedTransfer)
        } else if (direction == Direction.ToPolkadot) {
          await trackToPolkadot(transfer, setUpdate, removeOngoingTransfer, addCompletedTransfer)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    pollUpdate()
  }, [addCompletedTransfer, direction, removeOngoingTransfer, transfer])

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <OngoingTransfer
          transfer={transfer}
          update={update}
          senderDisplay={senderDisplay}
          recipientDisplay={recipientDisplay}
        />
      </DialogTrigger>
      <DialogContent
        className="ongoing-transfer-dialog max-w-[90vw] max-h-[80vh] rounded-4xl sm:max-w-[30.5rem] m-auto overflow-scroll"
        hideCloseButton={true}
      >
        {/* Modal header */}
        <DialogHeader
          className={
            'flex flex-col items-center justify-center space-y-6 rounded-t-[32px] border border-turtle-secondary-dark bg-turtle-secondary-light py-5 sm:py-10'
          }
        >
          <DialogTitle className="sr-only">Ongoing transfer</DialogTitle>
          <DialogDescription className="sr-only">
            Ongoing transfer status and details
          </DialogDescription>
          <div className={'flex items-center justify-center space-x-4 text-turtle-secondary-dark'}>
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={transfer.sourceChain.logoURI}
                  alt={`${transfer.sourceChain.name}`}
                  fill={true}
                  className={'rounded-full border border-turtle-secondary-dark'}
                />
              </div>
              <div className="text-sm">{transfer.sourceChain.name}</div>
            </div>
            <ArrowRight className="h-2 w-2" fill={colors['turtle-secondary-dark']} />
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={transfer.destChain.logoURI}
                  alt={`${transfer.destChain.name}`}
                  fill={true}
                  className={'rounded-full border border-turtle-secondary-dark'}
                />
              </div>
              <div className="text-sm">{transfer.destChain.name}</div>
            </div>
          </div>
          <h3
            className={
              'flex items-center space-x-1 text-3xl font-medium leading-none text-turtle-secondary-dark sm:text-5xl'
            }
          >
            <p>{toHuman(transfer.amount, transfer.token).toFixed(3)}</p>
            <p>{transfer.token.symbol}</p>
          </h3>
          <div className={'flex items-center space-x-4 text-sm text-turtle-secondary-dark'}>
            <div>{formatDate(transfer.date)}</div>
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div className="flex w-full flex-1 flex-col items-center gap-4 rounded-b-4xl border border-x-turtle-secondary border-b-turtle-secondary bg-white p-4 sm:p-10">
          {/* Update and progress bar */}
          <div
            className={
              'block h-[60px] w-full gap-2 rounded-lg border border-turtle-secondary-dark bg-turtle-secondary-light px-4 text-sm text-turtle-secondary-dark'
            }
          >
            <div className="my-2 flex items-center justify-between">
              <p className="font-bold text-turtle-secondary-dark text-left">{update}</p>
              <p className="text-normal text-turtle-secondary">{formatDate(transfer.date)}</p>
            </div>
            <div className="mb-2 h-2 rounded-full bg-turtle-secondary-light">
              <div
                className="h-2 rounded-full border border-turtle-secondary-dark bg-turtle-secondary"
                style={{ width: '60%' }}
              ></div>
            </div>
          </div>

          {/* sender */}
          <div className="relative mt-2 w-full rounded-lg border border-turtle-level3">
            <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
              Sender
            </div>
            <div className="p-4 text-sm">
              <div className="flex items-center gap-x-2">
                {transfer.sourceChain.network == Network.Polkadot ? (
                  <Identicon
                    value={transfer.sender}
                    size={16}
                    theme="polkadot"
                    className={'rounded-full border border-turtle-secondary-dark'}
                  />
                ) : (
                  <div
                    className={
                      'h-4 w-4 rounded-full border border-turtle-secondary-dark bg-gradient-to-r from-violet-400 to-purple-300'
                    }
                  />
                )}

                <p className="text-sm">{senderDisplay}</p>
              </div>
            </div>

            <div className="relative border-t p-4 text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
                Receiver
              </div>
              <div className="flex items-center gap-x-2">
                {transfer.destChain.name === Network.Polkadot ? (
                  <Identicon
                    value={transfer.recipient}
                    size={16}
                    theme="polkadot"
                    className={'rounded-full border border-turtle-secondary-dark'}
                  />
                ) : (
                  <div
                    className={
                      'h-4 w-4 rounded-full border border-turtle-secondary-dark bg-gradient-to-r from-violet-400 to-purple-300'
                    }
                  />
                )}
                <p className="text-sm">{recipientDisplay}</p>
              </div>
            </div>
          </div>

          {/* fees */}
          <div className="w-full gap-10">
            <div className="mt-2 flex justify-between space-x-4 sm:flex-row px-1">
              <p className="text-sm">Transfer amount</p>
              <div className="flex space-x-1 text-sm">
                <p>{toHuman(transfer.amount, transfer.token).toFixed(3)}</p>
                <p>{transfer.token.symbol}</p>
                <p className="text-turtle-level5">TBD $</p>
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex justify-between space-x-4 sm:flex-row px-1">
              <p className="text-sm">Fees</p>
              <div className="flex space-x-1 text-sm">
                <p>{feeToHuman(transfer.fees)}</p>
                <p>{transfer.fees.token.symbol}</p>
                <p className="text-turtle-level5"> TBD $</p>
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex justify-between space-x-4 sm:flex-row px-1">
              <p className="text-sm">Min receive</p>
              <div className="flex space-x-1 text-sm">
                {/* TODO(nuno) */}
                <p>{toHuman(transfer.amount, transfer.token).toFixed(3)}</p>
                <p>{transfer.token.symbol}</p>
                {/* TODO(nuno) */}
                <p className="text-turtle-level5"> TBD $</p>
              </div>
            </div>
          </div>
          <a
            href={'#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View transaction on block explorer"
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-turtle-level3 py-1 mb-4 sm:m-0 text-sm hover:text-turtle-level5"
          >
            {/* use transaction hash */}
            <p>View on Block Explorer</p> <ArrowUpRight className="hover:text-turtle-level5" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const POLL_UPDATE_INTERVAL_MS: number = 10_000

async function trackToPolkadot(
  transfer: StoredTransfer,
  setUpdate: (x: string) => void,
  removeOngoingTransfer: (id: string) => void,
  addCompletedTransfer: (transfer: CompletedTransfer) => void,
) {
  const snowbridgeEnv = getEnvironment(transfer.environment)
  const context = await getContext(snowbridgeEnv)
  while (true) {
    const { status, result } = await Snowbridge.toPolkadot.trackSendProgressPolling(
      context,
      transfer.sendResult as Snowbridge.toPolkadot.SendResult,
    )

    if (status !== 'pending') {
      setUpdate('Done!')
      // Adds the new completed tx to storage
      addCompletedTransfer({
        id: transfer.id,
        result: result?.failure ? TxStatus.Failed : TxStatus.Succeeded,
        // hashes?: string[] TODO handle hashes
        // errors?: string[] TODO handle errors details
        token: transfer.token,
        sourceChain: transfer.sourceChain,
        destChain: transfer.destChain,
        amount: transfer.amount,
        fees: transfer.fees,
        // minTokenRecieved: transfer.amount, // TODO handle true minTokenRecieved value
        sender: transfer.sender,
        recipient: transfer.recipient,
        date: transfer.date,
      } satisfies CompletedTransfer)

      // Removes the ongoing tx from storage
      removeOngoingTransfer(transfer.id)
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

async function trackToEthereum(
  transfer: StoredTransfer,
  setUpdate: (x: string) => void,
  removeOngoingTransfer: (id: string) => void,
  addCompletedTransfer: (transfer: any) => void,
) {
  const snowbridgeEnv = getEnvironment(transfer.environment)
  const context = await getContext(snowbridgeEnv)
  while (true) {
    const { status, result } = await Snowbridge.toEthereum.trackSendProgressPolling(
      context,
      transfer.sendResult as Snowbridge.toEthereum.SendResult,
    )

    if (status !== 'pending') {
      //  Adds the new completed tx to storage
      addCompletedTransfer({
        id: transfer.id,
        result: result?.failure ? TxStatus.Failed : TxStatus.Succeeded,
        // hashes?: string[] TODO handle hashes
        // errors?: string[] TODO handle errors details
        token: transfer.token,
        sourceChain: transfer.sourceChain,
        destChain: transfer.destChain,
        amount: transfer.amount,
        fees: transfer.fees,
        // minTokenRecieved: transfer.amount,
        sender: transfer.sender,
        recipient: transfer.recipient,
        date: transfer.date,
      } satisfies CompletedTransfer)

      // Removes the ongoing tx from storage
      removeOngoingTransfer(transfer.id)
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

export default OngoingTransferDialog
