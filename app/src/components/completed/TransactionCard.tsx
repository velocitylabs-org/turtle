import Image from 'next/image'

import { TxStatus, CompletedTransfer, TransferResult } from '@/models/transfer'
import { cn } from '@/utils/cn'
import { formatHours } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'

import Account from '../Account'
import { ArrowRight } from '../svg/ArrowRight'
import { Fail } from '../svg/Fail'
import { Success } from '../svg/Success'

import { colors } from '../../../tailwind.config'

const statusIcon = (status: TransferResult) => {
  switch (status) {
    case TxStatus.Failed:
      return <Fail width={24} height={24} />
    default:
      return <Success width={24} height={24} />
  }
}

export const TransactionCard = ({ tx }: { tx: CompletedTransfer }) => {
  const transferSucceeded = tx.result === TxStatus.Succeeded
  return (
    <div
      className={cn(
        'flex items-center rounded-2xl border p-4 hover:cursor-pointer sm:gap-4',
        transferSucceeded
          ? 'border-turtle-level3  hover:bg-turtle-level1'
          : 'border-turtle-error  hover:border-turtle-error-dark',
      )}
    >
      <div className="w-full space-y-2 ">
        <div className="flex items-center justify-between">
          <div className="flex max-w-xs space-x-2 overflow-x-auto">
            <div>{statusIcon(tx.result)}</div>
            <div
              className={cn(
                'no-letter-spacing flex items-center space-x-1 text-xl leading-none',
                tx.result === TxStatus.Failed && 'text-turtle-error',
              )}
            >
              <span>{formatAmount(toHuman(tx.amount, tx.token))}</span>
              <span>{tx.token.symbol}</span>
            </div>
            <div
              className={cn(
                'flex items-center justify-between space-x-1 rounded-2xl border px-1 py-0.5',
                tx.result === TxStatus.Failed && 'border-turtle-error bg-turtle-error-light',
              )}
            >
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={tx.sourceChain.logoURI}
                  alt={`${tx.sourceChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border bg-background',
                    transferSucceeded ? 'border-black' : 'border-turtle-error',
                  )}
                />
              </div>
              <ArrowRight
                className="h-[0.45rem] w-[0.45rem]"
                {...(tx.result === TxStatus.Failed && { fill: colors['turtle-error'] })}
              />
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={tx.destChain.logoURI}
                  alt={`${tx.destChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border bg-background',
                    transferSucceeded ? 'border-black' : 'border-turtle-error',
                  )}
                />
              </div>
            </div>
          </div>
          <div
            className={cn(
              'text-[10px] sm:block sm:text-sm',
              transferSucceeded ? 'text-turtle-level5' : 'text-turtle-error',
            )}
          >
            {formatHours(tx.date)}
          </div>
        </div>
        <div
          className={cn(
            'flex items-center justify-start space-x-4',
            tx.result === TxStatus.Failed && 'text-turtle-error-dark',
          )}
        >
          <Account
            network={tx.sourceChain.network}
            address={tx.sender}
            className={transferSucceeded ? 'border-black' : 'border-turtle-error-dark'}
            allowCopy={false}
          />
          <ArrowRight
            className="h-3 w-3"
            {...(transferSucceeded
              ? { fill: colors['turtle-foreground'] }
              : { fill: colors['turtle-secondary-dark'] })}
          />
          <Account
            network={tx.destChain.network}
            address={tx.recipient}
            className={transferSucceeded ? 'border-black' : 'border-turtle-error-dark'}
            allowCopy={false}
          />
        </div>
        {!transferSucceeded && (
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
