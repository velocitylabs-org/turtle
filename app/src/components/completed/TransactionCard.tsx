import Image from 'next/image'

import { CompletedTransfer, TransferResult, TxStatus } from '@/models/transfer'
import { cn } from '@/utils/cn'
import { formatHours } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'

import Account from '../Account'
import { ArrowRight } from '../svg/ArrowRight'
import { Fail } from '../svg/Fail'
import { Info } from '../svg/Info'
import { Success } from '../svg/Success'

import { colors } from '../../../tailwind.config'
import { getSVGColor } from './TransactionDialog'

export const getStatusIcon = (status: TransferResult) => {
  switch (status) {
    case TxStatus.Failed:
      return <Fail width={24} height={24} fill={getSVGColor(status)} />
    case TxStatus.Undefined:
      return <Info width={24} height={24} fill={getSVGColor(status)} />
    default:
      return <Success width={24} height={24} fill={getSVGColor(status)} />
  }
}

export const TransactionCard = ({ tx }: { tx: CompletedTransfer }) => {
  const status = tx.result
  const transferFailed = status === TxStatus.Failed

  return (
    <div
      className={cn(
        'flex items-center rounded-2xl border p-4 hover:cursor-pointer sm:gap-4',
        getBorder(status),
      )}
    >
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex max-w-xs space-x-2 overflow-x-auto">
            <div>{getStatusIcon(status)}</div>
            <div
              className={cn(
                'no-letter-spacing flex items-center space-x-1 text-xl leading-none',
                transferFailed && 'text-turtle-error',
              )}
            >
              <span>{formatAmount(toHuman(tx.amount, tx.token))}</span>
              <span>{tx.token.symbol}</span>
            </div>
            <div
              className={cn(
                'flex items-center justify-between space-x-1 rounded-2xl border px-1 py-0.5',
                transferFailed && 'border-turtle-error bg-turtle-error-light',
              )}
            >
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={tx.sourceChain.logoURI}
                  alt={`${tx.sourceChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border bg-background',
                    transferFailed ? 'border-turtle-error' : 'border-black',
                  )}
                />
              </div>
              <ArrowRight
                className="h-[0.45rem] w-[0.45rem]"
                {...(transferFailed && { fill: colors['turtle-error'] })}
              />
              <div className="relative h-4 w-4 rounded-full">
                <Image
                  src={tx.destChain.logoURI}
                  alt={`${tx.destChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border bg-background',
                    transferFailed ? 'border-turtle-error' : 'border-black',
                  )}
                />
              </div>
            </div>
          </div>
          <div
            className={cn(
              'text-[10px] sm:block sm:text-sm',
              transferFailed ? 'text-turtle-error' : 'text-turtle-level5',
            )}
          >
            {formatHours(tx.date)}
          </div>
        </div>
        <div
          className={cn(
            'flex items-center justify-start space-x-4',
            transferFailed && 'text-turtle-error-dark',
          )}
        >
          <Account
            network={tx.sourceChain.network}
            addressType={tx.sourceChain.supportedAddressTypes?.at(0)}
            address={tx.sender}
            className={transferFailed ? 'border-turtle-error-dark' : 'border-black'}
            allowCopy={false}
          />
          <ArrowRight
            className="h-3 w-3"
            {...(transferFailed
              ? { fill: colors['turtle-secondary-dark'] }
              : { fill: colors['turtle-foreground'] })}
          />
          <Account
            network={tx.destChain.network}
            addressType={tx.destChain.supportedAddressTypes?.at(0)}
            address={tx.recipient}
            className={transferFailed ? 'border-turtle-error-dark' : 'border-black'}
            allowCopy={false}
          />
        </div>
        {status === TxStatus.Failed && (
          <div className="flex items-center justify-between rounded-lg bg-turtle-error-10 p-2 text-xs font-normal leading-3 text-turtle-error-dark">
            <div>
              <span className="mr-1 font-semibold">Oops!</span>This transaction failed
            </div>
            <span className="text-xs font-normal leading-3 underline hover:text-turtle-error">
              See more
            </span>
          </div>
        )}
        {status === TxStatus.Undefined && (
          <div className="flex items-center justify-between rounded-lg bg-turtle-tertiary p-2 text-xs font-normal leading-3 text-turtle-tertiary-dark">
            <div>
              <span className="mr-1 font-semibold">Sorry!</span>We are not sure what happened{' '}
            </div>
            <span className="text-xs font-normal leading-3 underline hover:text-turtle-background">
              See more
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

const getBorder = (result: TransferResult) => {
  switch (result) {
    case TxStatus.Undefined:
      return 'border-turtle-tertiary-dark/60 hover:border-turtle-tertiary-dark'
    case TxStatus.Failed:
      return 'border-turtle-error hover:border-turtle-error-dark'
    case TxStatus.Succeeded:
      return 'border-turtle-level3 hover:bg-turtle-level1'
  }
}
