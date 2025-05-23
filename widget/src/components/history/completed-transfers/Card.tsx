import { TokenLogo, cn } from '@velocitylabs-org/turtle-ui'
import { ArrowRight } from '@/assets/svg/ArrowRight'
import { Fail } from '@/assets/svg/Fail'
import { Info } from '@/assets/svg/Info'
import { Success } from '@/assets/svg/Success'
import Account from '@/components/Account'
import { CompletedTransfer, TransferResult, TxStatus } from '@/models/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, isSwap, toHuman } from '@/utils/transfer'

import { colors } from '../../../../tailwind.config'
import { getSVGColor } from './Dialog'

// eslint-disable-next-line react-refresh/only-export-components
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

export const CompletedTransferCard = ({ tx }: { tx: CompletedTransfer }) => {
  const status = tx.result
  const transferFailed = status === TxStatus.Failed

  return (
    <div
      className={cn(
        'mb-2 space-y-2 rounded-2xl border p-3 hover:cursor-pointer',
        getBorder(status),
      )}
    >
      <div className="w-full space-y-2 overflow-x-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>{getStatusIcon(status)}</div>
            <div
              className={cn(
                'px-2 text-lg font-normal tracking-[0] sm:text-xl',
                transferFailed ? 'text-turtle-error' : 'text-turtle-foreground',
              )}
            >
              {isSwap(tx) ? (
                <span className="flex items-center gap-1">
                  {formatAmount(toHuman(tx.destinationAmount, tx.destinationToken))}{' '}
                  <TokenLogo token={tx.destinationToken} sourceChain={tx.destChain} size={25} />
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  {formatAmount(toHuman(tx.sourceAmount, tx.sourceToken))}{' '}
                  <TokenLogo token={tx.sourceToken} sourceChain={tx.sourceChain} size={25} />
                </span>
              )}
            </div>
            <div
              className={cn(
                'flex h-[24px] items-center space-x-1 rounded-full border p-1',
                transferFailed && 'border-turtle-error bg-turtle-error-light',
              )}
            >
              <div className="relative h-4 w-4 rounded-full">
                <img
                  src={tx.sourceChain.logoURI as string}
                  alt={`${tx.sourceChain.name}`}
                  width={16}
                  height={16}
                  className={cn(
                    'rounded-full border bg-turtle-background',
                    transferFailed ? 'border-turtle-error' : 'border-black',
                  )}
                />
              </div>
              <ArrowRight
                className="h-[0.45rem] w-[0.45rem]"
                {...(transferFailed && { fill: colors['turtle-error'] })}
              />
              <div className="relative h-4 w-4 rounded-full">
                <img
                  src={tx.destChain.logoURI as string}
                  alt={`${tx.destChain.name}`}
                  width={16}
                  height={16}
                  className={cn(
                    'rounded-full border bg-turtle-background',
                    transferFailed ? 'border-turtle-error' : 'border-black',
                  )}
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              'flex-1 text-right text-sm',
              transferFailed ? 'text-turtle-error' : 'text-turtle-level5',
            )}
          >
            {formatOngoingTransferDate(tx.date)}
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
          <div className="flex items-center justify-between rounded-lg bg-turtle-error/10 p-2 text-xs font-normal leading-3 text-turtle-error-dark">
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
      return 'border-turtle-tertiary-dark-60 hover:border-turtle-tertiary-dark'
    case TxStatus.Failed:
      return 'border-turtle-error hover:border-turtle-error-dark'
    case TxStatus.Succeeded:
      return 'border-turtle-level3 hover:bg-turtle-level1'
  }
}
