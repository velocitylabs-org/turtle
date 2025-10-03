import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { cn, TokenLogo } from '@velocitylabs-org/turtle-ui'
import { ArrowRight } from '@/assets/svg/ArrowRight'
import { Cross } from '@/assets/svg/Cross'
import ExclamationMarkSimple from '@/assets/svg/ExclamationMarkSimple'
import { Fail } from '@/assets/svg/Fail'
import { Info } from '@/assets/svg/Info'
import { Success } from '@/assets/svg/Success'
import { type CompletedTransfer, type TransferResult, TxStatus } from '@/models/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'
import { getSVGColor } from './Dialog'

export const CompletedTransferCard = ({ tx }: { tx: CompletedTransfer }) => {
  const status = tx.result

  return (
    <div
      className={cn(
        'group flex items-center rounded-2xl border p-4 hover:cursor-pointer sm:gap-4 transition duration-200 ease-in',
        getStatusStyle(status),
      )}
    >
      <div className="w-full space-y-3">
        {/* Status & Date */}
        <div className="flex items-center justify-between">
          <div className="flex max-w-xs space-x-1 overflow-x-auto">
            <div>{getStatusIcon(status)}</div>
            <div className={cn('flex items-center space-x-1 leading-none font-bold')}>{getStatusHeadline(status)}</div>
          </div>
          <div className={'sm:block text-sm sm:text-sm text-turtle-level5 group-hover:text-turtle-level6'}>
            {formatOngoingTransferDate(tx.date)}
          </div>
        </div>

        {/* Tokens & Amounts  */}
        <div className={'flex items-center justify-between'}>
          {/* Source Token */}
          {getTokenAndAmount(status, tx.sourceChain, tx.sourceToken, tx.sourceAmount, tx.sourceTokenUSDValue)}

          {/* Source -> Dest Chain */}
          <div className="flex justify-between items-center gap-[2px] sm:gap-1 mx-1 sm:mx-3">
            <img
              src={tx.sourceChain.logoURI as string}
              alt={tx.sourceChain.name}
              className="h-[1rem] w-[1rem] rounded-full border border-turtle-foreground bg-turtle-background"
            />
            <div className="flex items-center justify-center w-[16px]">{getTxIcon(status)}</div>
            <img
              src={tx.destChain.logoURI as string}
              alt={tx.destChain.name}
              className="h-[1rem] w-[1rem] rounded-full border border-turtle-foreground bg-turtle-background"
            />
          </div>

          {/* Dest Token */}
          {getTokenAndAmount(
            status,
            tx.destChain,
            tx.destinationToken ?? tx.sourceToken,
            tx.destinationAmount ?? tx.sourceAmount,
            tx.destinationTokenUSDValue ?? tx.sourceTokenUSDValue,
          )}
        </div>
      </div>
    </div>
  )

  function getTxIcon(status: TxStatus) {
    switch (status) {
      case TxStatus.Succeeded:
        return <ArrowRight className="h-3 w-3" fill={colors['turtle-foreground']} />
      case TxStatus.Failed:
        return <Cross className="h-2.5 w-2.5" stroke={colors['turtle-error-dark']} />
      case TxStatus.Undefined:
        return <ExclamationMarkSimple className="h-3 w-1" fill={colors['turtle-tertiary-dark']} />
    }
  }

  function getBorderOnGroupHover(status: TxStatus) {
    switch (status) {
      case TxStatus.Undefined:
        return 'group-hover:border-turtle-tertiary-dark'
      case TxStatus.Failed:
        return 'group-hover:border-turtle-error-dark'
      case TxStatus.Succeeded:
        return 'group-hover:border-turtle-primary-dark'
    }
  }

  function getTokenAndAmount(status: TxStatus, chain: Chain, token: Token, amount: string, inDollars?: number) {
    const formattedAmount = toHuman(amount, token)
    const amountInDollars = (inDollars ?? 0) * formattedAmount

    return (
      <div
        className={cn(
          'flex items-center bg-turtle-level1 border border-turtle-level5 p-1 gap-1 sm:p-2 sm:gap-2 rounded-lg w-[96px] sm:w-[160px] h-[48px] justify-center group-hover:bg-turtle-background',
          getBorderOnGroupHover(status),
        )}
      >
        <TokenLogo token={token} sourceChain={chain} size={32} />
        {/* Amount token & dolar */}
        <div className="flex flex-col justify-start items-left gap-1 sm:gap-0 text-left pl-1">
          <div className="text-normal sm:text-xl leading-none">{formatAmount(toHuman(amount, token))}</div>
          <div className="text-xs text-turtle-level6 leading-none">${formatAmount(amountInDollars)}</div>
        </div>
      </div>
    )
  }
}

function getStatusStyle(result: TransferResult) {
  switch (result) {
    case TxStatus.Undefined:
      return 'border-turtle-level5 hover:border-turtle-tertiary-dark hover:bg-turtle-tertiary-light'
    case TxStatus.Failed:
      return 'border-turtle-level5 hover:border-turtle-error-dark hover:bg-turtle-error-light'
    case TxStatus.Succeeded:
      return 'border-turtle-level5 hover:border-turtle-primary-dark hover:bg-turtle-primary-light'
  }
}

export function getStatusIcon(status: TransferResult) {
  switch (status) {
    case TxStatus.Failed:
      return <Fail width={24} height={24} fill={getSVGColor(status)} />
    case TxStatus.Undefined:
      return <Info width={24} height={24} fill={getSVGColor(status)} />
    default:
      return <Success width={24} height={24} fill={getSVGColor(status)} />
  }
}

function getStatusHeadline(status: TransferResult) {
  switch (status) {
    case TxStatus.Failed:
      return <span className="text-turtle-error-dark">Failed</span>
    case TxStatus.Undefined:
      return <span className="text-turtle-tertiary-dark">Untraceable</span>
    default:
      return <span className="text-turtle-primary-dark">Successful</span>
  }
}
