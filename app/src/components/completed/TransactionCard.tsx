'use client'
import Image from 'next/image'
import { useEnsName } from 'wagmi'
import Identicon from '@polkadot/react-identicon'

import useEnvironment from '@/hooks/useEnvironment'
import { Status, Transaction, TransactionStatus } from '@/models/completedTransactions'
import { getChainLogoURI } from '@/services/chains'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'
import { formatHours } from '@/utils/datetime'

import { ArrowRight } from './TransactionIcons/ArrowRight'
import { Fail } from './TransactionIcons/Fail'
import { Pending } from './TransactionIcons/Pending'
import { Success } from './TransactionIcons/Success'

const statusIcon = (status: TransactionStatus) => {
  switch (status) {
    case Status.Failed:
      return <Fail width={24} height={24} />
    case Status.Pending:
      return <Pending width={24} height={24} />
    default:
      return <Success width={24} height={24} />
  }
}

export const TransactionCard = ({ tx }: { tx: Transaction }) => {
  const { environment } = useEnvironment()
  const { data: ensName } = useEnsName({
    address: tx.fromAddress as `0x${string}`,
  })
  return (
    <div
      className={cn(
        'flex items-center rounded-2xl border p-4 hover:cursor-pointer sm:gap-4',
        tx.status === Status.Completed
          ? 'border-turtle-level3  hover:bg-turtle-level1'
          : 'border-turtle-error  hover:border-turtle-error-dark',
      )}
    >
      <div className="w-full space-y-2 ">
        <div className="flex items-center justify-center sm:justify-between">
          <div className="flex max-w-xs space-x-2 overflow-x-auto">
            <div>{statusIcon(tx.status)}</div>
            <div
              className={cn(
                'flex items-center space-x-1 text-xl font-medium leading-none',
                tx.status === Status.Failed && 'text-turtle-error',
              )}
            >
              <p>{tx.fromChainAmount.toFixed(2)}</p>
              <p>{tx.fromChainToken}</p>
            </div>
            <div
              className={cn(
                'flex items-center justify-between space-x-1 rounded-2xl border px-1 py-0.5',
                tx.status === Status.Failed && 'border-turtle-error bg-turtle-error-light',
              )}
            >
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={getChainLogoURI(tx.fromChain, environment)}
                  alt={`Velocity Labs. Handles transactions from ${tx.fromChain}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.status === Status.Completed ? 'border-black' : 'border-turtle-error',
                  )}
                />
              </div>
              <ArrowRight
                className="h-[0.45rem] w-[0.45rem]"
                {...(tx.status === Status.Failed && { fill: '#FF35C3' })}
              />
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={getChainLogoURI(tx.toChain, environment)}
                  alt={`Velocity Labs. Handles transactions to ${tx.toChain}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.status === Status.Completed ? 'border-black' : 'border-turtle-error',
                  )}
                />
              </div>
            </div>
          </div>
          <div
            className={cn(
              'hidden text-sm sm:block',
              tx.status === Status.Completed ? 'text-turtle-level5' : 'text-turtle-error',
            )}
          >
            {formatHours(tx.timestamp)}
          </div>
        </div>
        <div
          className={cn(
            'flex items-center justify-center space-x-4 sm:justify-start',
            tx.status === Status.Failed && 'text-turtle-error-dark',
          )}
        >
          <div className="flex items-center gap-x-1">
            {tx.fromChain === 'Polkadot' ? (
              <Identicon
                value={tx.fromAddress}
                size={14}
                theme="polkadot"
                className={cn(
                  'rounded-full border',
                  tx.status === Status.Completed ? 'border-black' : 'border-turtle-error-dark',
                )}
              />
            ) : (
              <div
                className={cn(
                  'h-4 w-4 rounded-full border bg-gradient-to-r from-violet-400 to-purple-300',
                  tx.status === Status.Completed ? 'border-black ' : 'border-turtle-error-dark',
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
          <ArrowRight
            className="h-3 w-3"
            {...(tx.status === Status.Completed ? { fill: '#001B04' } : { fill: '#A184DC' })}
          />
          <div className="flex items-center gap-x-2">
            {tx.toChain === 'Polkadot' ? (
              <Identicon
                value={tx.toAddress}
                size={14}
                theme="polkadot"
                className={cn(
                  'rounded-full border',
                  tx.status === Status.Completed ? 'border-black' : 'border-turtle-error-dark',
                )}
              />
            ) : (
              <div
                className={cn(
                  'h-4 w-4 rounded-full border bg-gradient-to-r from-violet-400 to-purple-300',
                  tx.status === Status.Completed ? 'border-black ' : 'border-turtle-error-dark',
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
        {tx.status === Status.Failed && (
          <p className="flex items-center justify-between rounded-lg bg-[#FF35C31A] p-2 text-xs font-normal leading-3 text-turtle-error-dark">
            This transaction failed.{' '}
            <span className="text-xs font-normal leading-3 underline hover:text-turtle-error">
              See more
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
