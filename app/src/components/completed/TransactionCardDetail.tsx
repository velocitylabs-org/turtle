import { cn } from '@/utils/cn'
import Icon from '@/components/Icon'
import ArrowRight from '@/components/svg/ArrowRight'
import { formatAmount, toHuman } from '@/utils/transfer'
import TokenLogo from '@/components/TokenLogo'
import { formatCompletedTransferDate, formatHours } from '@/utils/datetime'
import { getStatusIcon } from '@/components/completed/TransactionCard'
import { CompletedTransfer, TransferResult, TxStatus } from '@/models/transfer'
import Account from '@/components/Account'
import { colors } from '../../../tailwind.config'
import ArrowUpRight from '@/components/svg/ArrowUpRight'
import Tooltip from '@/components/Tooltip'
import Cross from'@/components/svg/Cross'

interface TransactionHistoryCardDetailProps {
  tx: CompletedTransfer | null,
  unSelectTx: () => void,
}

export default function TransactionCardDetail({ tx, unSelectTx }: TransactionHistoryCardDetailProps) {
  if (!tx) return null;
  return (
    <div className="relative">
      <Tooltip showIcon={false} content="Go Back">
        <div role="button" onClick={() => unSelectTx()} className="absolute top-[-22] right-[-15] sm:top-[-23] sm:right-[-23] p-[4] flex items-center justify-center">
          <Cross className="h-[20] w-[20] sm:h-[25] sm:w-[25]" stroke={colors['turtle-foreground']}/>
        </div>
      </Tooltip>
      <div
        className="flex flex-col gap-2 mb-4"
      >
        <div className={cn('flex items-center justify-center space-x-2 rounded-2xl border w-fit m-auto py-1 px-2', getTextColor(tx.result))}>
          <div className="turtle-success-dark flex items-center justify-center space-x-1">
            <Icon
              src={tx.sourceChain.logoURI}
              width={22}
              height={22}
              className={cn('rounded-full border bg-background', getBorder(tx.result))}
            />
            <div className="text-xs sm:text-sm">{tx.sourceChain.name}</div>
          </div>
          <ArrowRight className="h-3 w-3" fill={getSVGColor(tx.result)} />
          <div className="turtle-success-dark flex items-center justify-center space-x-1">
            <Icon
              src={tx.destChain.logoURI}
              width={22}
              height={22}
              className={cn('rounded-full border bg-background', getBorder(tx.result))}
            />
            <div className="text-xs sm:text-sm">{tx.destChain.name}</div>
          </div>
        </div>
        <h3
          className={cn(
            'xxl-letter-spacing text-lg flex items-center justify-center space-x-3 leading-none sm:text-4xl',
            getTextColor(tx.result),
          )}
        >
          <span>{formatAmount(toHuman(tx.amount, tx.token))}</span>
          <TokenLogo token={tx.token} sourceChain={tx.sourceChain} size={35} />
        </h3>
        <div
          className={cn(
            'flex items-center justify-center space-x-4 text-xs',
            getTextColor(tx.result),
          )}
        >
          <div>{formatCompletedTransferDate(tx.date)}</div>
          <div>{formatHours(tx.date)}</div>
        </div>
      </div>

      <div
        className={cn(
          'mt-[-1px] flex w-full flex-1 flex-col items-center gap-3 bg-white',
          getBorderTop(tx.result),
        )}
      >
        <div
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-1 text-xs justify-center',
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
        <div className="relative mt-2 w-full rounded-lg border border-turtle-level3 flex flex-col sm:flex-row">
          {/* sender */}
          <div className="relative p-4 text-sm flex-1">
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
          {/* Receiver */}
          <div className="relative p-4 text-sm flex-1 border-t sm:border-t-0 sm:border-l">
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
        <div className="summary w-full space-y-1 px-3">
          {/* Amount */}
          <div className="flex items-start justify-between space-x-4">
            <div className="font-bold text-sm">Amount</div>
            <div className="items-right flex flex-col space-x-1">
              <div className="text-right">
                <div className="text-sm">
                  {formatAmount(toHuman(tx.amount, tx.token), 'Long')} {tx.token.symbol}
                </div>
                {typeof tx.tokenUSDValue == 'number' && (
                  <div className="text-xs text-turtle-level4">
                    $
                    {formatAmount(toHuman(tx.amount, tx.token) * (tx.tokenUSDValue ?? 0), 'Long')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Execution fee */}
          <div className="flex items-start justify-between space-x-4">
            <div className="font-bold text-sm">{tx.bridgingFee ? 'Execution fee' : 'Fee'}</div>
            <div className="items-right flex flex-col space-x-1 text-right">
              <div className="text-sm">
                {formatAmount(toHuman(tx.fees.amount, tx.fees.token), 'Long')}{' '}
                {tx.fees.token.symbol}
              </div>
              {typeof tx.tokenUSDValue == 'number' && (
                <div className="text-xs text-turtle-level4">
                  ${formatAmount(tx.fees.inDollars, 'Long')}
                </div>
              )}
            </div>
          </div>

          {/* Bridging fee */}
          {tx.bridgingFee && (
            <div className="flex items-start justify-between space-x-4">
              <div className="font-bold text-sm">Bridging fee</div>
              <div className="items-right flex flex-col space-x-1 text-right">
                <div className="text-sm">
                  {formatAmount(toHuman(tx.bridgingFee.amount, tx.bridgingFee.token), 'Long')}{' '}
                  {tx.bridgingFee.token.symbol}
                </div>
                {typeof tx.tokenUSDValue == 'number' && (
                  <div className="text-xs text-turtle-level4">
                    ${formatAmount(tx.bridgingFee.inDollars, 'Long')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {tx.explorerLink && (
          <a
            href={tx.explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View your completed transaction on block explorer"
            className="w-full md:w-auto flex items-center justify-center space-x-2 rounded-lg border border-turtle-level3 text-sm hover:text-turtle-level5 py-1 sm:py-1.5 px-3"
          >
            <p>View on Block Explorer</p> <ArrowUpRight className="hover:text-turtle-level5" />
          </a>
          )}
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

export function getSVGColor (result: TransferResult) {
  switch (result) {
    case TxStatus.Undefined:
      return colors['turtle-tertiary-dark']
    case TxStatus.Failed:
      return colors['turtle-error-dark']
    default:
      return colors['turtle-primary-dark']
  }
}
