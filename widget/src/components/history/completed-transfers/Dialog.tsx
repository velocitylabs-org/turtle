import { CompletedTransfer, TransferResult, TxStatus } from '@/models/transfer'
import { CompletedTransferCard, getStatusIcon } from './Card'
import Account from '@/components/Account'
import { Icon } from '@/components/Icon'
import { TokenLogo } from '@/components/TokenLogo'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/utils/helper'
import { formatCompletedTransferDate } from '@/utils/datetime'
import { formatAmount, isSwap, toHuman } from '@/utils/transfer'

import { ArrowRight } from '@/assets/svg/ArrowRight'
import { ArrowUpRight } from '@/assets/svg/ArrowUpRight'
import { colors } from '../../../../tailwind.config'

export const CompletedTransferDialog = ({ tx }: { tx: CompletedTransfer }) => {
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <CompletedTransferCard tx={tx} />
      </DialogTrigger>
      <DialogContent
        className="completed-transfer m-auto max-h-[85vh] max-w-[90vw] overflow-scroll rounded-4xl sm:max-w-[27rem]"
        hideCloseButton={true}
      >
        <DialogHeader
          className={cn(
            'flex flex-col gap-2 rounded-tl-4xl rounded-tr-4xl border p-4',
            getBorder(tx.result),
            getBg(tx.result),
          )}
        >
          <DialogTitle className="sr-only">Completed transfer</DialogTitle>
          <DialogDescription className="sr-only">
            Completed transfer status and details
          </DialogDescription>
          <div
            className={cn(
              'm-auto flex w-fit items-center justify-center space-x-2 rounded-2xl border px-2 py-1',
              getTextColor(tx.result),
              getBg(tx.result),
              getBorder(tx.result),
            )}
          >
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={tx.sourceChain.logoURI}
                width={22}
                height={22}
                className={cn('rounded-full border bg-turtle-background', getBorder(tx.result))}
              />
              <div className="text-xs sm:text-sm">{tx.sourceChain.name}</div>
            </div>
            <ArrowRight className="h-3 w-3" fill={getSVGColor(tx.result)} />
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={tx.destChain.logoURI}
                width={22}
                height={22}
                className={cn('rounded-full border bg-turtle-background', getBorder(tx.result))}
              />
              <div className="text-xs sm:text-sm">{tx.destChain.name}</div>
            </div>
          </div>
          <h3
            className={cn(
              'xxl-letter-spacing flex items-center justify-center space-x-3 text-lg leading-none sm:text-4xl',
              getTextColor(tx.result),
            )}
          >
            <span>{formatAmount(toHuman(tx.sourceAmount, tx.sourceToken))}</span>
            <TokenLogo token={tx.sourceToken} sourceChain={tx.sourceChain} size={35} />
            {isSwap(tx) && (
              <>
                <ArrowRight className="h-3 w-3" fill={getSVGColor(tx.result)} />
                <span>{formatAmount(toHuman(tx.destinationAmount, tx.destinationToken))}</span>
                <TokenLogo token={tx.destinationToken} sourceChain={tx.destChain} size={35} />
              </>
            )}
          </h3>
          <div className={cn('flex items-center justify-center text-xs', getTextColor(tx.result))}>
            {formatCompletedTransferDate(tx.date)}
          </div>
          {/* Status bar */}
          <div
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg text-xs',
              getTextColor(tx.result),
              getBorder(tx.result),
            )}
          >
            <span className="relative bottom-[1px]">{getStatusIcon(tx.result)}</span>
            {tx.result === TxStatus.Undefined ? (
              <p className="text-left">We are not sure what happened to this transfer</p>
            ) : tx.result === TxStatus.Succeeded ? (
              <p className="text-left">
                <span className="pe-0.5 font-semibold">Done!</span>
                This transfer is completed
              </p>
            ) : (
              <p className="text-left">
                <span className="font-semibold">This transfer failed! </span>
                {tx.errors?.length && tx.errors[tx.errors?.length - 1]}
              </p>
            )}
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div className="flex w-full flex-1 flex-col items-center gap-4 rounded-bl-4xl rounded-br-4xl border border-t-0 border-x-turtle-secondary border-b-turtle-secondary bg-white p-4">
          {/* sender */}
          <div className="relative mt-2 grid w-full grid-cols-1 grid-rows-2 gap-2 sm:grid-cols-2 sm:grid-rows-1 sm:gap-1">
            <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-turtle-level3 bg-white p-2">
              <ArrowRight className="h-3 w-3 rotate-90 sm:rotate-0" />
            </div>
            <div className="relative rounded-lg border border-turtle-level3 p-4 text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
                Sender
              </div>
              <Account
                network={tx.sourceChain.network}
                addressType={tx.sourceChain.supportedAddressTypes?.at(0)}
                address={tx.sender}
                size={24}
                className={getBorder(tx.result)}
              />
            </div>

            <div className="relative rounded-lg border border-turtle-level3 p-4 text-right text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5 sm:left-auto sm:right-2.5">
                Receiver
              </div>
              <div className="flex items-center justify-start sm:justify-end">
                <Account
                  network={tx.destChain.network}
                  addressType={tx.destChain.supportedAddressTypes?.at(0)}
                  address={tx.recipient}
                  size={24}
                  className={getBorder(tx.result)}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="summary my-3 w-full space-y-3 px-1">
            {/* Amount sent */}
            <SummaryRow
              label="Amount Sent"
              amount={formatAmount(toHuman(tx.sourceAmount, tx.sourceToken), 'Long')}
              symbol={tx.sourceToken.symbol}
              usdValue={
                typeof tx.sourceTokenUSDValue === 'number'
                  ? formatAmount(
                      toHuman(tx.sourceAmount, tx.sourceToken) * (tx.sourceTokenUSDValue ?? 0),
                      'Long',
                    )
                  : undefined
              }
            />

            {/* Amount received */}
            {isSwap(tx) && (
              <SummaryRow
                label="Amount Received"
                amount={formatAmount(toHuman(tx.destinationAmount, tx.destinationToken), 'Long')}
                symbol={tx.destinationToken.symbol}
                usdValue={
                  typeof tx.destinationTokenUSDValue === 'number'
                    ? formatAmount(
                        toHuman(tx.destinationAmount, tx.destinationToken) *
                          (tx.destinationTokenUSDValue ?? 0),
                        'Long',
                      )
                    : undefined
                }
              />
            )}

            {/* Fees */}
            <SummaryRow
              label={tx.bridgingFee ? 'Execution fee' : 'Fee'}
              amount={formatAmount(toHuman(tx.fees.amount, tx.fees.token), 'Long')}
              symbol={tx.fees.token.symbol}
              usdValue={
                typeof tx.sourceTokenUSDValue === 'number'
                  ? formatAmount(tx.fees.inDollars, 'Long')
                  : undefined
              }
            />

            {/* Bridging Fee */}
            {tx.bridgingFee && (
              <SummaryRow
                label="Bridging fee"
                amount={formatAmount(toHuman(tx.bridgingFee.amount, tx.bridgingFee.token), 'Long')}
                symbol={tx.bridgingFee.token.symbol}
                usdValue={
                  typeof tx.sourceTokenUSDValue === 'number'
                    ? formatAmount(tx.bridgingFee.inDollars, 'Long')
                    : undefined
                }
              />
            )}

            {tx.explorerLink && (
              <a
                href={tx.explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View your completed transaction on block explorer"
                className="mb-4 flex w-full items-center justify-center space-x-2 rounded-lg border border-turtle-level3 py-1 text-sm hover:text-turtle-level5 sm:m-0"
              >
                <p>View on Block Explorer</p> <ArrowUpRight className="hover:text-turtle-level5" />
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SummaryRowProps {
  label: string
  amount: string
  symbol: string
  usdValue?: string
}

export function SummaryRow({ label, amount, symbol, usdValue }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between space-x-4">
      <div className="text-sm font-medium">{label}</div>
      <div className="items-right flex flex-col space-x-1 text-right">
        <div className="text-sm">
          {amount} {symbol}
        </div>
        {usdValue && <div className="text-xs text-turtle-level4">${usdValue}</div>}
      </div>
    </div>
  )
}

const getTextColor = (result: TransferResult) => {
  switch (result) {
    case TxStatus.Undefined:
      return 'text-turtle-tertiary-dark'
    case TxStatus.Failed:
      return 'text-turtle-error-dark'
    default:
      return 'text-turtle-success-dark'
  }
}

const getBg = (result: TransferResult) => {
  switch (result) {
    case TxStatus.Undefined:
      return 'bg-turtle-tertiary-70'
    case TxStatus.Failed:
      return 'bg-turtle-error-light'
    default:
      return 'bg-turtle-success-light'
  }
}

const getBorder = (result: TransferResult) => {
  switch (result) {
    case TxStatus.Undefined:
      return 'border-turtle-tertiary-dark'
    case TxStatus.Failed:
      return 'border-turtle-error-dark'
    default:
      return 'border-turtle-success-dark'
  }
}

const getBorderTop = (result: TransferResult) => {
  switch (result) {
    case TxStatus.Undefined:
      return 'border-t-turtle-tertiary-dark'
    case TxStatus.Failed:
      return 'border-t-turtle-error-dark'
    default:
      return 'border-t-turtle-success-dark'
  }
}

/* eslint-disable react-refresh/only-export-components */
export const getSVGColor = (result: TransferResult) => {
  switch (result) {
    case TxStatus.Undefined:
      return colors['turtle-tertiary-dark']
    case TxStatus.Failed:
      return colors['turtle-error-dark']
    default:
      return colors['turtle-primary-dark']
  }
}
