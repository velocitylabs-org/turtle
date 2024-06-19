'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Identicon from '@polkadot/react-identicon'

import useEnvironment from '@/hooks/useEnvironment'
import { Status, Transaction, TransactionStatus } from '@/models/history'
import { getChainLogoURI } from '@/services/history'
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
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border p-4 hover:cursor-pointer',
        tx.status === 'completed'
          ? 'border-turtle-level3  hover:bg-turtle-level1'
          : 'border-turtle-error  hover:border-turtle-error-dark',
      )}
    >
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex max-w-xs space-x-2 overflow-x-auto">
            <div>{statusIcon(tx.status)}</div>
            <div
              className={cn(
                'flex items-center space-x-1 text-xl font-medium leading-none',
                tx.status === 'failed' && 'text-turtle-error',
              )}
            >
              <p>{tx.amount.toFixed(2)}</p>
              <p>{tx.token}</p>
            </div>
            <div
              className={cn(
                'flex items-center justify-between space-x-1 rounded-2xl border px-1 py-0.5',
                tx.status === 'failed' && 'border-turtle-error bg-turtle-error-light',
              )}
            >
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={getChainLogoURI(tx.fromChain, environment)}
                  alt={`Velocity Labs. Handles transactions from ${tx.fromChain}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.status === 'completed' ? 'border-black' : 'border-turtle-error',
                  )}
                />
              </div>
              <ArrowRight
                className="h-2 w-2"
                {...(tx.status === 'failed' && { fill: '#FF35C3' })}
              />
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={getChainLogoURI(tx.toChain, environment)}
                  alt={`Velocity Labs. Handles transactions to ${tx.toChain}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.status === 'completed' ? 'border-black' : 'border-turtle-error',
                  )}
                />
              </div>
            </div>
          </div>
          <div
            className={cn(
              'text-sm',
              tx.status === 'completed' ? 'text-turtle-level5' : 'text-turtle-error',
            )}
          >
            {formatHours(tx.timestamp)}
          </div>
        </div>
        <div
          className={cn(
            'flex items-center space-x-4',
            tx.status === 'failed' && 'text-turtle-error-dark',
          )}
        >
          {/* check ENS domains */}
          <div className="flex items-center gap-x-1">
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
            <p className="text-sm">{truncateAddress(tx.fromAddress)}</p>
          </div>
          <ArrowRight className="h-3 w-3" fill={'#A184DC'} />
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
            <p className="text-sm">{truncateAddress(tx.toAddress)}</p>
          </div>
        </div>
        {tx.status === 'failed' && (
          <p className="flex items-center justify-between rounded-lg bg-turtle-error-light px-2 py-1 text-sm text-turtle-error-dark">
            This transaction failed.{' '}
            <Link href={'/history'} className="text-sm underline hover:text-turtle-error">
              See more
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
