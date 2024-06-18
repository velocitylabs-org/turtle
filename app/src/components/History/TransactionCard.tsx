'use client'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import React from 'react'
import { Status, Transaction, TransactionStatus } from './TransactionHistory'
import { Pending } from '../TransactionIcons/Pending'
import { Fail } from '../TransactionIcons/Fail'
import { Success } from '../TransactionIcons/Success'
import Identicon from '@polkadot/react-identicon'
import { truncateWithDashAddress } from '@/utils/address'
import { ArrowRight } from './ArrowRight'
import Link from 'next/link'
import { Environment } from '@/store/environmentStore'
import { REGISTRY } from '@/config/registry'
import useEnvironment from '@/hooks/useEnvironment'

export const statusIcon = (status: TransactionStatus) => {
  switch (status) {
    case Status.Failed:
      return <Fail />
    case Status.Pending:
      return <Pending />
    default:
      return <Success />
  }
}

export const getChainLogo = (chainName: string, environment: Environment) => {
  const registery = REGISTRY[environment]
  const chainData = registery.chains.filter(x => x.network === chainName)
  return chainData[0].logoURI
}

export const formatHours = (time: string) => {
  const hoursIndex = time.indexOf(':')
  const minsIndex = time.indexOf(':', hoursIndex + 1)
  if (minsIndex === -1) {
    return '-'
  }
  const splitTime = time.substring(0, minsIndex).split('T')[1]
  const timeAcr = Number(splitTime.split(':')[0]) > 12 ? 'pm' : 'am'
  return `${splitTime} ${timeAcr}`
}

export const TransactionCard = ({ tx }: { tx: Transaction }) => {
  const { environment } = useEnvironment()
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border p-4 hover:cursor-pointer',
        tx.status === 'completed'
          ? 'border-turtle-level3  hover:bg-turtle-level1'
          : 'border-turtle-error bg-turtle-error-light hover:border-turtle-error-dark',
      )}
    >
      <div>{statusIcon(tx.status)}</div>
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex max-w-60 space-x-2 overflow-x-auto">
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
                tx.status === 'failed' && 'border-turtle-error',
              )}
            >
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={getChainLogo(tx.fromChain, environment)}
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
                  src={getChainLogo(tx.toChain, environment)}
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
            <p className="text-sm">{truncateWithDashAddress(tx.fromAddress)}</p>
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
            <p className="text-sm">{truncateWithDashAddress(tx.toAddress)}</p>
          </div>
        </div>
        {tx.status === 'failed' && (
          <p className="text-start text-sm text-turtle-error-dark">
            This transaction failed.{' '}
            <Link href={'/history'} className="underline hover:text-turtle-error">
              See more
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
