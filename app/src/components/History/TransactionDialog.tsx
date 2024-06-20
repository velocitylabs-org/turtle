'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEnsName } from 'wagmi'
import Identicon from '@polkadot/react-identicon'

import useEnvironment from '@/hooks/useEnvironment'
import { Transaction } from '@/models/history'
import { cn } from '@/utils/cn'
import { truncateAddress } from '@/utils/address'
import { formatDate, formatHours } from '@/utils/datetime'
import { getChainLogoURI } from '@/services/history'

import { TransactionCard } from './TransactionCard'
import { ArrowRight } from './TransactionIcons/ArrowRight'
import { ArrowUpRight } from './TransactionIcons/ArrowUpRight'
import { ExclamationMark } from './TransactionIcons/ExclamationMark'

import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogClose } from '../ui/dialog'
import { Separator } from '../ui/separator'

export const TransactionDialog = ({ tx }: { tx: Transaction }) => {
  const { environment } = useEnvironment()
  const { data: ensName } = useEnsName({
    address: tx.fromAddress as `0x${string}`,
  })
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <TransactionCard tx={tx} />
      </DialogTrigger>
      <DialogContent
        className="max-w-[24rem] rounded-3xl sm:max-w-[30.5rem]"
        hideCloseButton={true}
      >
        <DialogHeader
          className={cn(
            'flex flex-col items-center justify-center space-y-6 rounded-t-2xl border py-5 sm:py-10',
            tx.status === 'completed'
              ? 'border-turtle-success-dark bg-turtle-success-light'
              : 'border-turtle-error-dark bg-turtle-error-light ',
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center space-x-4',
              tx.status === 'completed' ? ' text-turtle-success-dark' : 'text-turtle-error-dark ',
            )}
          >
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={getChainLogoURI(tx.fromChain, environment)}
                  alt={`Velocity Labs. Handles transactions from ${tx.fromChain}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.status === 'completed'
                      ? 'border-turtle-success-dark'
                      : 'border-turtle-error-dark ',
                  )}
                />
              </div>
              <div className="text-sm">{tx.fromChain}</div>
            </div>
            <ArrowRight
              className="h-2 w-2"
              {...(tx.status === 'failed' ? { fill: '#8D1269' } : { fill: '#008115' })}
            />
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={getChainLogoURI(tx.toChain, environment)}
                  alt={`Velocity Labs. Handles transactions from ${tx.toChain}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.status === 'completed'
                      ? 'border-turtle-success-dark'
                      : 'border-turtle-error-dark ',
                  )}
                />
              </div>
              <div className="text-sm">{tx.toChain}</div>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center space-x-1 text-3xl font-medium leading-none sm:text-5xl ',
              tx.status === 'completed' ? 'text-turtle-success-dark' : ' text-turtle-error-dark',
            )}
          >
            <p>{tx.fromChainAmount.toFixed(2)}</p>
            <p>{tx.fromChainToken}</p>
          </div>
          <div
            className={cn(
              'flex items-center space-x-4 text-sm',
              tx.status === 'completed' ? 'text-turtle-success-dark' : ' text-turtle-error-dark',
            )}
          >
            <div>{formatDate(tx.timestamp.split('T')[0])}</div>
            <div>{formatHours(tx.timestamp)}</div>
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div className="flex w-full flex-1 flex-col items-center gap-4 rounded-b-2xl border border-x-turtle-secondary border-b-turtle-secondary bg-white p-4 sm:p-10">
          <div
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-2 py-4 text-sm',
              tx.status === 'completed'
                ? 'border-turtle-success-dark bg-turtle-success-light text-turtle-success-dark'
                : 'border-turtle-error-dark bg-turtle-error-light text-turtle-error-dark',
            )}
          >
            <ExclamationMark
              {...(tx.status === 'failed' ? { fill: '#8D1269' } : { fill: '#008115' })}
            />
            {tx.status !== 'failed' ? (
              <p>
                <span className="pe-0.5 font-medium">Done!</span>
                This transfer is completed.
              </p>
            ) : (
              <p className="w-5/6 space-x-0.5">
                <span className="font-medium">This transfer failed.</span>
                You likely don’t have enough DAI in your receiving wallet.{' '}
                <Link href={'/history'} className="underline hover:text-turtle-error">
                  Try it again
                </Link>
              </p>
            )}
          </div>
          {/* sender */}
          <div className="relative w-full rounded-lg border border-turtle-level3">
            <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
              Sender
            </div>
            <div className="p-4 text-sm">
              <div className="flex items-center gap-x-2">
                {tx.fromChain === 'Polkadot' ? (
                  <Identicon
                    value={tx.fromAddress}
                    size={16}
                    theme="polkadot"
                    className={cn(
                      'rounded-full border',
                      tx.status === 'completed' ? 'border-black' : 'border-turtle-error-dark',
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border bg-gradient-to-r from-violet-400 to-purple-300',
                      tx.status === 'completed' ? 'border-black ' : 'border-turtle-error-dark',
                    )}
                  />
                )}
                <p className="text-sm">
                  {tx.fromChain === 'Ethereum'
                    ? ensName
                      ? ensName
                      : truncateAddress(tx.fromAddress)
                    : truncateAddress(tx.fromAddress)}
                </p>
              </div>
            </div>

            <div className="relative border-t p-4 text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
                Receiver
              </div>
              <div className="flex items-center gap-x-2">
                {tx.toChain === 'Polkadot' ? (
                  <Identicon
                    value={tx.toAddress}
                    size={16}
                    theme="polkadot"
                    className={cn(
                      'rounded-full border',
                      tx.status === 'completed' ? 'border-black' : 'border-turtle-error-dark',
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border bg-gradient-to-r from-violet-400 to-purple-300',
                      tx.status === 'completed' ? 'border-black ' : 'border-turtle-error-dark',
                    )}
                  />
                )}
                <p className="text-sm">
                  {tx.toChain === 'Ethereum'
                    ? ensName
                      ? ensName
                      : truncateAddress(tx.toAddress)
                    : truncateAddress(tx.toAddress)}
                </p>
              </div>
            </div>
          </div>

          {/* fees */}
          <div className="w-full gap-10">
            <div className="flex flex-col items-center justify-between space-x-4 sm:flex-row">
              <p className="text-sm">Transfer amount</p>
              <div className="flex space-x-1 text-sm">
                <p>{tx.fromChainAmount.toFixed(2)}</p>
                <p>{tx.fromChainToken}</p>
                <p className="text-turtle-level5">${tx.fromChainAmountValue.toFixed(2)}</p>
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex flex-col items-center justify-between sm:flex-row">
              <p className="text-sm">Fees</p>
              <div className="flex space-x-1 text-sm">
                <p>{tx.fees.toFixed(2)}</p>
                <p>{tx.fromChainToken}</p>
                <p className="text-turtle-level5">${tx.feesValue.toFixed(2)}9</p>
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex flex-col items-center justify-between sm:flex-row">
              <p className="text-sm">Min receive</p>
              <div className="flex space-x-1 text-sm">
                <p>{tx.minTokenRecieved.toFixed(2)}</p>
                <p>{tx.toChainToken}</p>
                <p className="text-turtle-level5">${tx.minTokenRecievedValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center space-x-2 rounded-lg border border-turtle-level3 py-1 text-sm">
            <p>View on Block Explorer</p> <ArrowUpRight />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
