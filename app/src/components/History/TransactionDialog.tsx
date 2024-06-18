'use client'
import { Transaction, formatDate } from './TransactionHistory'
import Image from 'next/image'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { TransactionCard, formatHours, getChainLogo } from './TransactionCard'
import useEnvironment from '@/hooks/useEnvironment'
import { cn } from '@/utils/cn'
import { ArrowRight } from './ArrowRight'
import { ExclamationMark } from './ExclamationMark'
import { ArrowUpRight } from './ArrowUpRight'
import Link from 'next/link'
import Identicon from '@polkadot/react-identicon'
import { truncateWithDashAddress } from '@/utils/address'
export const TransactionDialog = ({ tx }: { tx: Transaction }) => {
  const { environment } = useEnvironment()
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <TransactionCard tx={tx} />
      </DialogTrigger>
      <DialogContent className="sm:w-[31.5rem]">
        <DialogHeader
          className={cn(
            'flex flex-col items-center justify-center space-y-6 rounded-t-2xl border py-10',
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
                  src={getChainLogo(tx.fromChain, environment)}
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
                  src={getChainLogo(tx.toChain, environment)}
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
              'flex items-center space-x-1 text-5xl font-medium leading-none ',
              tx.status === 'completed' ? 'text-turtle-success-dark' : ' text-turtle-error-dark',
            )}
          >
            <p>{tx.amount.toFixed(2)}</p>
            <p>{tx.token}</p>
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
        <div className="flex w-full flex-1 flex-col items-center gap-4 rounded-b-2xl border border-x-turtle-secondary border-b-turtle-secondary bg-white p-10">
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
                <span className="font-medium">Done!</span>
                This transfer is completed.
              </p>
            ) : (
              <p className="w-5/6">
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
                      'h-4 w-4 rounded-full border bg-turtle-level3',
                      tx.status === 'completed' ? 'border-black ' : 'border-turtle-error-dark',
                    )}
                  />
                )}
                <p className="text-sm">{truncateWithDashAddress(tx.fromAddress)}</p>
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
                      'h-4 w-4 rounded-full border bg-turtle-level3',
                      tx.status === 'completed' ? 'border-black ' : 'border-turtle-error-dark',
                    )}
                  />
                )}
                <p className="text-sm">{truncateWithDashAddress(tx.toAddress)}</p>
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
