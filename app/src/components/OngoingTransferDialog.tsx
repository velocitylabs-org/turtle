'use client'

import Image from 'next/image'
import { useEnsName } from 'wagmi'
import Identicon from '@polkadot/react-identicon'

import { Transfer } from '@/models/transfer'
import { truncateAddress } from '@/utils/address'

import { ArrowRight } from './svg/ArrowRight'
import { ArrowUpRight } from './svg/ArrowUpRight'

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from './ui/dialog'
import { Separator } from './ui/separator'

import OngoingTransfer from './OngoingTransfer'
import { formatDate, toHuman } from '@/utils/transfer'
import { useEffect, useState } from 'react'
import { Direction, resolveDirection } from '@/services/transfer'
import * as Snowbridge from '@snowbridge/api'
import { Network } from '@/models/chain'
import { colors } from '../../tailwind.config'

export const OngoingTransferDialog = ({ transfer }: { transfer: Transfer }) => {
  const { data: ensName } = useEnsName({
    address: transfer.sender as `0x${string}`,
  })

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
    <Dialog>
      <DialogTrigger className="w-full">
        <OngoingTransfer transfer={transfer} update={update} />
      </DialogTrigger>
      <DialogContent
        className="max-w-[24rem] rounded-4xl sm:max-w-[30.5rem]"
        hideCloseButton={true}
      >
        {/* Modal header */}
        <DialogHeader
          className={
            'flex flex-col items-center justify-center space-y-6 rounded-t-[32px] border border-turtle-secondary-dark bg-turtle-secondary-light py-5 sm:py-10'
          }
        >
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
            <p>{toHuman(transfer.amount, transfer.token).toFixed(2)}</p>
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
              <p className="font-bold text-purple-600 text-turtle-secondary-dark">{update}</p>
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

                <p className="text-sm">
                  {transfer.sourceChain.network === Network.Ethereum
                    ? ensName ?? truncateAddress(transfer.sender)
                    : truncateAddress(transfer.sender)}
                </p>
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
                <p className="text-sm">
                  {transfer.destChain.network === Network.Ethereum
                    ? ensName ?? truncateAddress(transfer.recipient)
                    : truncateAddress(transfer.recipient)}
                </p>
              </div>
            </div>
          </div>

          {/* fees */}
          <div className="w-full gap-10">
            <div className="mt-2 flex flex-col items-center justify-between space-x-4 sm:flex-row">
              <p className="text-sm">Transfer amount</p>
              <div className="flex space-x-1 text-sm">
                <p>{toHuman(transfer.amount, transfer.token).toFixed(2)}</p>
                <p>{transfer.token.symbol}</p>
                <p className="text-turtle-level5">${transfer.amount}</p>
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex flex-col items-center justify-between sm:flex-row">
              <p className="text-sm">Fees</p>
              <div className="flex space-x-1 text-sm">
                <p>{toHuman(transfer.feeAmount, transfer.feeToken).toFixed(2)}</p>
                <p>{transfer.feeToken.symbol}</p>
                <p className="text-turtle-level5"> TBD $</p>
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex flex-col items-center justify-between sm:flex-row">
              <p className="text-sm">Min receive</p>
              <div className="flex space-x-1 text-sm">
                {/* TODO(nuno) */}
                <p>{toHuman(transfer.amount, transfer.token).toFixed(2)}</p>
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
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-turtle-level3 py-1 text-sm hover:text-turtle-level5"
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

export default OngoingTransferDialog
