import { CompletedTransfer, TransferResult, TxStatus } from '@/models/transfer'
import { cn } from '@/utils/cn'
import { formatCompletedTransferDate, formatHours } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'
import { colors } from '../../../tailwind.config'
import Account from '../Account'
import { Icon } from '../Icon'
import { ArrowRight } from '../svg/ArrowRight'
import { ArrowUpRight } from '../svg/ArrowUpRight'
import { TokenLogo } from '../TokenLogo'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { getStatusIcon, TransactionCard } from './TransactionCard'

export const TransactionDialog = ({ tx }: { tx: CompletedTransfer }) => {
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <TransactionCard tx={tx} />
      </DialogTrigger>
      <DialogContent
        className="completed-transfer m-auto max-h-[85vh] max-w-[90vw] overflow-scroll rounded-4xl sm:max-w-[30.5rem]"
        hideCloseButton={true}
      >
        <DialogHeader
          className={cn(
            'flex flex-col items-center justify-center space-y-4 rounded-t-4xl border py-6',
            getBorder(tx.result),
            getBg(tx.result),
          )}
        >
          <DialogTitle className="sr-only">Completed transfer</DialogTitle>
          <DialogDescription className="sr-only">
            Completed transfer status and details
          </DialogDescription>
          <div
            className={cn('flex items-center justify-center space-x-4', getTextColor(tx.result))}
          >
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={tx.sourceChain.logoURI}
                width={32}
                height={32}
                className={cn('rounded-full border bg-background', getBorder(tx.result))}
              />
              <div className="text-sm">{tx.sourceChain.name}</div>
            </div>
            <ArrowRight className="h-3 w-3" fill={getSVGColor(tx.result)} />
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={tx.destChain.logoURI}
                width={32}
                height={32}
                className={cn('rounded-full border bg-background', getBorder(tx.result))}
              />
              <div className="text-sm">{tx.destChain.name}</div>
            </div>
          </div>
          <h3
            className={cn(
              'xxl-letter-spacing flex items-center space-x-3 text-3xl leading-none sm:text-5xl',
              getTextColor(tx.result),
            )}
          >
            <span>{formatAmount(toHuman(tx.amount, tx.destinationToken))}</span>
            <TokenLogo token={tx.destinationToken} sourceChain={tx.sourceChain} size={40} />
          </h3>
          <div className={cn('flex items-center space-x-4 text-sm', getTextColor(tx.result))}>
            <div>{formatCompletedTransferDate(tx.date)}</div>
            <div>{formatHours(tx.date)}</div>
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div
          className={cn(
            'mt-[-1px] flex w-full flex-1 flex-col items-center gap-4 rounded-b-4xl border border-x-turtle-secondary border-b-turtle-secondary bg-white p-4 sm:p-10',
            getBorderTop(tx.result),
          )}
        >
          <div
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-sm',
              getTextColor(tx.result),
              getBg(tx.result),
              getBorder(tx.result),
            )}
          >
            {getStatusIcon(tx.result)}
            {tx.result === TxStatus.Undefined ? (
              <p>We are not sure what happened to this transfer</p>
            ) : tx.result === TxStatus.Succeeded ? (
              <p>
                <span className="mr-1 pe-0.5 font-semibold">Done!</span>
                This transfer is completed.
              </p>
            ) : (
              <p className="w-5/6 space-x-0.5">
                <span className="font-semibold">This transfer failed!</span>
                {tx.errors?.length && tx.errors[tx.errors?.length - 1]}
              </p>
            )}
          </div>
          {/* sender */}
          <div className="relative mt-2 w-full rounded-lg border border-turtle-level3">
            <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
              Sender
            </div>
            <div className="p-4 text-sm">
              <Account
                network={tx.sourceChain.network}
                addressType={tx.sourceChain.supportedAddressTypes?.at(0)}
                address={tx.sender}
                size={24}
                className={getBorder(tx.result)}
              />
            </div>

            <div className="relative border-t p-4 text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
                Receiver
              </div>
              <Account
                network={tx.destChain.network}
                addressType={tx.destChain.supportedAddressTypes?.at(0)}
                address={tx.recipient}
                size={24}
                className={getBorder(tx.result)}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="summary my-3 w-full space-y-3 px-1">
            {/* Amount */}
            <div className="flex items-start justify-between space-x-4">
              <div className="font-bold">Amount</div>
              <div className="items-right flex flex-col space-x-1">
                <div className="text-right">
                  <div className="text-lg">
                    {formatAmount(toHuman(tx.amount, tx.destinationToken), 'Long')}{' '}
                    {tx.destinationToken.symbol}
                  </div>
                  {typeof tx.tokenUSDValue == 'number' && (
                    <div className="text-turtle-level4">
                      $
                      {formatAmount(
                        toHuman(tx.amount, tx.destinationToken) * (tx.tokenUSDValue ?? 0),
                        'Long',
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="flex items-start justify-between space-x-4">
              <div className="font-bold">Fees</div>
              <div className="items-right flex flex-col space-x-1 text-right">
                <div>
                  {formatAmount(toHuman(tx.fees.amount, tx.fees.token), 'Long')}{' '}
                  {tx.fees.token.symbol}
                </div>
                {typeof tx.tokenUSDValue == 'number' && (
                  <div className="text-turtle-level4">
                    ${formatAmount(tx.fees.inDollars, 'Long')}
                  </div>
                )}
              </div>
            </div>
          </div>

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
      </DialogContent>
    </Dialog>
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
      return 'bg-turtle-tertiary/70'
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
