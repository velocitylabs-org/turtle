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

interface TransactionHistoryCardDetailProps {
  tx: null | CompletedTransfer,
  unSelectTx: () => void,
}

export default function TransactionHistoryCardDetail({ tx, unSelectTx }: TransactionHistoryCardDetailProps) {
  return (
    <div>
      <div
        style={{
          gap: 15,
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 20,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '-10px',
            top: '-20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          onClick={() => unSelectTx()}
        >
          <ArrowRight className="h-3 w-3" fill={'black'} style={{ transform: 'rotate(180deg)' }} />
          <div style={{ fontSize: '13px' }}>Back</div>
        </div>
        <div className={cn('flex items-center justify-center space-x-4', getTextColor(tx.result))}>
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
            'xxl-letter-spacing text-md flex items-center justify-center space-x-3 leading-none sm:text-4xl',
            getTextColor(tx.result),
          )}
        >
          <span>{formatAmount(toHuman(tx.amount, tx.token))}</span>
          <TokenLogo token={tx.token} sourceChain={tx.sourceChain} size={40} />
        </h3>
        <div
          className={cn(
            'flex items-center justify-center space-x-4 text-sm',
            getTextColor(tx.result),
          )}
        >
          <div>{formatCompletedTransferDate(tx.date)}</div>
          <div>{formatHours(tx.date)}</div>
        </div>
      </div>

      {/* Modal content */}
      <div
        className={cn(
          'mt-[-1px] flex w-full flex-1 flex-col items-center gap-4 bg-white',
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
        {/*Summary*/}
        {/*<div className="summary mb-[10] mt-[10] flex w-full justify-between gap-3">*/}
        {/*  /!* Amount *!/*/}
        {/*  <div className="flex items-start justify-between space-x-4">*/}
        {/*    <div className="font-bold">Amount</div>*/}
        {/*    <div className="items-right flex flex-col space-x-1">*/}
        {/*      <div className="text-right">*/}
        {/*        <div className="text-sm">*/}
        {/*          {formatAmount(toHuman(tx.amount, tx.token), 'Long')} {tx.token.symbol}*/}
        {/*        </div>*/}
        {/*        {typeof tx.tokenUSDValue == 'number' && (*/}
        {/*          <div className="text-sm text-turtle-level4">*/}
        {/*            ${formatAmount(toHuman(tx.amount, tx.token) * (tx.tokenUSDValue ?? 0), 'Long')}*/}
        {/*          </div>*/}
        {/*        )}*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}

        {/*  /!* Fees *!/*/}
        {/*  /!* Execution fee *!/*/}
        {/*  <div className="flex items-start justify-between space-x-4">*/}
        {/*    <div className="font-bold">{tx.bridgingFee ? 'Execution fee' : 'Fee'}</div>*/}
        {/*    <div className="items-right flex flex-col space-x-1 text-right">*/}
        {/*      <div className="text-sm">*/}
        {/*        {formatAmount(toHuman(tx.fees.amount, tx.fees.token), 'Long')}{' '}*/}
        {/*        {tx.fees.token.symbol}*/}
        {/*      </div>*/}
        {/*      {typeof tx.tokenUSDValue == 'number' && (*/}
        {/*        <div className="text-sm text-turtle-level4">*/}
        {/*          ${formatAmount(tx.fees.inDollars, 'Long')}*/}
        {/*        </div>*/}
        {/*      )}*/}
        {/*    </div>*/}
        {/*  </div>*/}

        {/*  /!* Bridging fee *!/*/}
        {/*  {tx.bridgingFee && (*/}
        {/*    <div className="flex items-start justify-between space-x-4">*/}
        {/*      <div className="font-bold">Bridging fee</div>*/}
        {/*      <div className="items-right flex flex-col space-x-1 text-right">*/}
        {/*        <div className="text-lg">*/}
        {/*          {formatAmount(toHuman(tx.bridgingFee.amount, tx.bridgingFee.token), 'Long')}{' '}*/}
        {/*          {tx.bridgingFee.token.symbol}*/}
        {/*        </div>*/}
        {/*        {typeof tx.tokenUSDValue == 'number' && (*/}
        {/*          <div className="text-turtle-level4">*/}
        {/*            ${formatAmount(tx.bridgingFee.inDollars, 'Long')}*/}
        {/*          </div>*/}
        {/*        )}*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*</div>*/}
        {/*{tx.explorerLink && (*/}
        {/*  <a*/}
        {/*    href={tx.explorerLink}*/}
        {/*    target="_blank"*/}
        {/*    rel="noopener noreferrer"*/}
        {/*    aria-label="View your completed transaction on block explorer"*/}
        {/*    className="flex w-full items-center justify-center space-x-2 rounded-lg border border-turtle-level3 py-1 text-sm hover:text-turtle-level5 sm:m-0"*/}
        {/*  >*/}
        {/*    <p>View on Block Explorer</p> <ArrowUpRight className="hover:text-turtle-level5" />*/}
        {/*  </a>*/}
        {/*)}*/}
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
