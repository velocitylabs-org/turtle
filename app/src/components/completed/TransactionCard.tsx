'use client'
import Image from 'next/image'
import { useEnsName } from 'wagmi'
import Identicon from '@polkadot/react-identicon'

import { TxStatus, CompletedTransfer, TransferResult } from '@/models/transfer'
import { Network } from '@/models/chain'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'
import { formatHours } from '@/utils/datetime'
import { toHuman } from '@/utils/transfer'

import { ArrowRight } from '../svg/ArrowRight'
import { Fail } from '../svg/Fail'
import { Pending } from '../svg/Pending'
import { Success } from '../svg/Success'

import { colors } from '../../../tailwind.config'

const statusIcon = (status: TransferResult) => {
  switch (status) {
    case TxStatus.Failed:
      return <Fail width={24} height={24} />
    case TxStatus.Pending:
      return <Pending width={24} height={24} />
    default:
      return <Success width={24} height={24} />
  }
}

export const TransactionCard = ({ tx }: { tx: CompletedTransfer }) => {
  const { data: ensName } = useEnsName({
    address: tx.sender as `0x${string}`,
  })
  return (
    <div
      className={cn(
        'flex items-center rounded-2xl border p-4 hover:cursor-pointer sm:gap-4',
        tx.transferResult === TxStatus.Completed
          ? 'border-turtle-level3  hover:bg-turtle-level1'
          : 'border-turtle-error  hover:border-turtle-error-dark',
      )}
    >
      <div className="w-full space-y-2 ">
        <div className="flex items-center justify-center sm:justify-between">
          <div className="flex max-w-xs space-x-2 overflow-x-auto">
            <div>{statusIcon(tx.transferResult)}</div>
            <div
              className={cn(
                'flex items-center space-x-1 text-xl font-medium leading-none',
                tx.transferResult === TxStatus.Failed && 'text-turtle-error',
              )}
            >
              <p>{toHuman(tx.amount, tx.token).toFixed(3)}</p>
              <p>{tx.token.symbol}</p>
            </div>
            <div
              className={cn(
                'flex items-center justify-between space-x-1 rounded-2xl border px-1 py-0.5',
                tx.transferResult === TxStatus.Failed &&
                  'border-turtle-error bg-turtle-error-light',
              )}
            >
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={tx.sourceChain.logoURI}
                  alt={`${tx.sourceChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.transferResult === TxStatus.Completed
                      ? 'border-black'
                      : 'border-turtle-error',
                  )}
                />
              </div>
              <ArrowRight
                className="h-[0.45rem] w-[0.45rem]"
                {...(tx.transferResult === TxStatus.Failed && { fill: colors['turtle-error'] })}
              />
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={tx.destChain.logoURI}
                  alt={`${tx.destChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border',
                    tx.transferResult === TxStatus.Completed
                      ? 'border-black'
                      : 'border-turtle-error',
                  )}
                />
              </div>
            </div>
          </div>
          <div
            className={cn(
              'hidden text-sm sm:block',
              tx.transferResult === TxStatus.Completed ? 'text-turtle-level5' : 'text-turtle-error',
            )}
          >
            {formatHours(tx.date)}
          </div>
        </div>
        <div
          className={cn(
            'flex items-center justify-center space-x-4 sm:justify-start',
            tx.transferResult === TxStatus.Failed && 'text-turtle-error-dark',
          )}
        >
          <div className="flex items-center gap-x-1">
            {tx.sourceChain.network === Network.Polkadot ? (
              <Identicon
                value={tx.sender}
                size={14}
                theme="polkadot"
                className={cn(
                  'rounded-full border',
                  tx.transferResult === TxStatus.Completed
                    ? 'border-black'
                    : 'border-turtle-error-dark',
                )}
              />
            ) : (
              <div
                className={cn(
                  'h-4 w-4 rounded-full border bg-gradient-to-r from-violet-400 to-purple-300',
                  tx.transferResult === TxStatus.Completed
                    ? 'border-black '
                    : 'border-turtle-error-dark',
                )}
              />
            )}
            <p className="text-sm">
              {tx.sourceChain.network === Network.Ethereum
                ? ensName
                  ? ensName
                  : truncateAddress(tx.sender)
                : truncateAddress(tx.sender)}
            </p>
          </div>
          <ArrowRight
            className="h-3 w-3"
            {...(tx.transferResult === TxStatus.Completed
              ? { fill: colors['turtle-foreground'] }
              : { fill: colors['turtle-secondary-dark'] })}
          />
          <div className="flex items-center gap-x-2">
            {tx.destChain.network === Network.Polkadot ? (
              <Identicon
                value={tx.recipient}
                size={14}
                theme="polkadot"
                className={cn(
                  'rounded-full border',
                  tx.transferResult === TxStatus.Completed
                    ? 'border-black'
                    : 'border-turtle-error-dark',
                )}
              />
            ) : (
              <div
                className={cn(
                  'h-4 w-4 rounded-full border bg-gradient-to-r from-violet-400 to-purple-300',
                  tx.transferResult === TxStatus.Completed
                    ? 'border-black '
                    : 'border-turtle-error-dark',
                )}
              />
            )}
            <p className="text-sm">
              {tx.destChain.network === Network.Ethereum
                ? ensName
                  ? ensName
                  : truncateAddress(tx.recipient)
                : truncateAddress(tx.recipient)}
            </p>
          </div>
        </div>
        {tx.transferResult === TxStatus.Failed && (
          <p className="flex items-center justify-between rounded-lg bg-turtle-error/10 p-2 text-xs font-normal leading-3 text-turtle-error-dark">
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
