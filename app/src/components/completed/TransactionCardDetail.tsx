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
import Cross from '@/components/svg/Cross'

interface TransactionHistoryCardDetailProps {
  tx: CompletedTransfer | null
  unSelectTx: () => void
}

export default function TransactionCardDetail({
  tx,
  unSelectTx,
}: TransactionHistoryCardDetailProps) {
  if (!tx) return null
  return (
    <div className="relative">
      <Tooltip showIcon={false} content="Go Back">
        <div
          role="button"
          onClick={() => unSelectTx()}
          className="absolute right-[-15] top-[-22] flex items-center justify-center p-[4] sm:right-[-23] sm:top-[-23]"
        >
          <Cross
            className="h-[20] w-[20] sm:h-[25] sm:w-[25]"
            stroke={colors['turtle-foreground']}
          />
        </div>
      </Tooltip>
      <div className="mb-4 flex flex-col gap-2">
        <div
          className={cn(
            'm-auto flex w-fit items-center justify-center space-x-2 rounded-2xl border px-2 py-1',
            getTextColor(tx.result),
          )}
        >
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
            'xxl-letter-spacing flex items-center justify-center space-x-3 text-lg leading-none sm:text-4xl',
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
            'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1 text-xs',
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
        <div className="relative mt-2 flex w-full flex-col rounded-lg border border-turtle-level3 sm:flex-row">
          {/* sender */}
          <div className="relative flex-1 p-4 text-sm">
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
          <div className="relative flex-1 border-t p-4 text-sm sm:border-l sm:border-t-0">
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
          <SummaryRow
            label="Amount"
            amount={formatAmount(toHuman(tx.amount, tx.token), 'Long')}
            symbol={tx.token.symbol}
            usdValue={
              typeof tx.tokenUSDValue === 'number'
                ? formatAmount(toHuman(tx.amount, tx.token) * (tx.tokenUSDValue ?? 0), 'Long')
                : undefined
            }
          />

          <SummaryRow
            label={tx.bridgingFee ? 'Execution fee' : 'Fee'}
            amount={formatAmount(toHuman(tx.fees.amount, tx.fees.token), 'Long')}
            symbol={tx.fees.token.symbol}
            usdValue={
              typeof tx.tokenUSDValue === 'number'
                ? formatAmount(tx.fees.inDollars, 'Long')
                : undefined
            }
          />

          {tx.bridgingFee && (
            <SummaryRow
              label="Bridging fee"
              amount={formatAmount(toHuman(tx.bridgingFee.amount, tx.bridgingFee.token), 'Long')}
              symbol={tx.bridgingFee.token.symbol}
              usdValue={
                typeof tx.tokenUSDValue === 'number'
                  ? formatAmount(tx.bridgingFee.inDollars, 'Long')
                  : undefined
              }
            />
          )}
        </div>
        {tx.explorerLink && (
          <a
            href={tx.explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View your completed transaction on block explorer"
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-turtle-level3 px-3 py-1 text-sm hover:text-turtle-level5 sm:py-1.5 md:w-auto"
          >
            <p>View on Block Explorer</p> <ArrowUpRight className="hover:text-turtle-level5" />
          </a>
        )}
      </div>
    </div>
  )
}

interface SummaryRowProps {
  label: string
  amount: string
  symbol: string
  usdValue?: string
}

function SummaryRow({ label, amount, symbol, usdValue }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between space-x-4">
      <div className="text-sm font-bold">{label}</div>
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

export function getSVGColor(result: TransferResult) {
  switch (result) {
    case TxStatus.Undefined:
      return colors['turtle-tertiary-dark']
    case TxStatus.Failed:
      return colors['turtle-error-dark']
    default:
      return colors['turtle-primary-dark']
  }
}
