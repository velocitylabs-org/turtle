import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { Icon, TokenLogo } from '@velocitylabs-org/turtle-ui'
import { useCallback } from 'react'
import ChainflipRefund from '@/components/ChainflipRefund'
import type { StoredTransfer } from '@/models/transfer'
import { resolveDirection } from '@/services/transfer'
import { isChainflipSwap } from '@/utils/chainflip'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, getExplorerLink, isSwap as isPolkadotSwap, toHuman } from '@/utils/transfer'
import Account from '../Account'
import { SummaryRow } from '../completed/TransactionDialog'
import ArrowRight from '../svg/ArrowRight'
import ArrowUpRight from '../svg/ArrowUpRight'
import TransferEstimate from '../TransferEstimate'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import OngoingTransactionCard from './OngoingTransactionCard'

interface OngoingTransactionDialogProps {
  transfer: StoredTransfer
  status?: string
}

export default function OngoingTransactionDialog({ transfer, status }: OngoingTransactionDialogProps) {
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)
  const explorerLink = getExplorerLink(transfer)

  const sourceAmountHuman = toHuman(transfer.sourceAmount, transfer.sourceToken)
  const sourceAmountUSD = sourceAmountHuman * (transfer.sourceTokenUSDValue ?? 0)

  const isSwap =
    isPolkadotSwap(transfer) ||
    isChainflipSwap(transfer.sourceChain, transfer.destChain, transfer.sourceToken, transfer.destinationToken)

  const destinationAmountHuman =
    isSwap && transfer.destinationAmount && transfer.destinationToken
      ? toHuman(transfer.destinationAmount, transfer.destinationToken)
      : 0
  const destinationAmountUSD = destinationAmountHuman * (transfer.destinationTokenUSDValue ?? 0)

  const getStatus = useCallback(
    (status?: string) => {
      if (typeof status === 'string') return status
      if (transfer.status) return transfer.status
      return 'Pending'
    },
    [transfer.status],
  )

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <OngoingTransactionCard transfer={transfer} status={getStatus(status)} direction={direction} />
      </DialogTrigger>
      <DialogContent
        className="ongoing-transfer-dialog max-h-[85vh] max-w-[90vw] overflow-scroll rounded-4xl sm:max-w-[27rem]"
        hideCloseButton
      >
        <div>
          <DialogHeader className="flex flex-col gap-2 rounded-tl-4xl rounded-tr-4xl border border-turtle-secondary-dark bg-turtle-secondary-light p-4">
            <DialogTitle className="sr-only">Ongoing transfer</DialogTitle>
            <DialogDescription className="sr-only">Ongoing transfer status and details</DialogDescription>
            <div className="m-auto flex w-fit items-center justify-center space-x-2 rounded-2xl border border-turtle-secondary-dark bg-turtle-secondary-light px-2 py-1 text-turtle-secondary-dark">
              <div className="turtle-success-dark flex items-center justify-center space-x-1">
                <Icon
                  src={(transfer.sourceChain.logoURI as Record<string, string>).src}
                  width={22}
                  height={22}
                  className="rounded-full border border-turtle-secondary-dark bg-turtle-background"
                />
                <div className="text-xs sm:text-sm">{transfer.sourceChain.name}</div>
              </div>
              <ArrowRight className="h-3 w-3" fill={colors['turtle-secondary-dark']} />
              <div className="turtle-success-dark flex items-center justify-center space-x-1">
                <Icon
                  src={(transfer.destChain.logoURI as Record<string, string>).src}
                  width={22}
                  height={22}
                  className="rounded-full border border-turtle-secondary-dark bg-turtle-background"
                />
                <div className="text-xs sm:text-sm">{transfer.destChain.name}</div>
              </div>
            </div>

            <h3 className="xxl-letter-spacing text-turtle-secondary-dark' flex items-center justify-center space-x-3 text-lg leading-none sm:text-4xl">
              <span>{formatAmount(sourceAmountHuman, 'Long')}</span>
              <TokenLogo token={transfer.sourceToken} sourceChain={transfer.sourceChain} size={35} />

              {isSwap && transfer.destinationToken && (
                <>
                  <ArrowRight className="h-3 w-3" fill={colors['turtle-secondary-dark']} />
                  <span>{formatAmount(destinationAmountHuman, 'Long')}</span>
                  <TokenLogo token={transfer.destinationToken} sourceChain={transfer.destChain} size={35} />
                </>
              )}
            </h3>

            {/* Update and progress bar */}
            <div className="!mb-[-10px] !mt-[-5px] block w-full gap-2 rounded-xl bg-turtle-secondary-light px-4 text-sm text-turtle-secondary-dark">
              <div className="my-2 flex items-center justify-between">
                <p className="text-left font-bold text-turtle-secondary-dark">{getStatus(status)}</p>
                <p className="text-xs text-turtle-secondary">{formatOngoingTransferDate(transfer.date)}</p>
              </div>
              <TransferEstimate transfer={transfer} direction={direction} outlinedProgressBar={true} />
            </div>
          </DialogHeader>

          {/* Modal content */}
          <div className="flex w-full flex-1 flex-col items-center gap-4 rounded-bl-4xl rounded-br-4xl border border-t-0 border-x-turtle-secondary border-b-turtle-secondary bg-white p-4">
            {/* sender */}
            <div className="relative mt-3 grid w-full grid-cols-1 grid-rows-2 gap-2 sm:grid-cols-2 sm:grid-rows-1 sm:gap-1">
              <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-turtle-level3 bg-white p-2">
                <ArrowRight className="h-3 w-3 rotate-90 sm:rotate-0" />
              </div>
              <div className="relative rounded-lg border border-turtle-level3 p-4 text-sm">
                <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">Sender</div>
                <Account
                  network={transfer.sourceChain.network}
                  addressType={transfer.sourceChain.supportedAddressTypes?.at(0)}
                  address={transfer.sender}
                  size={24}
                />
              </div>
              <div className="relative rounded-lg border border-turtle-level3 p-4 text-right text-sm">
                <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5 sm:left-auto sm:right-2.5">
                  Receiver
                </div>
                <div className="flex items-center justify-start sm:justify-end">
                  <Account
                    network={transfer.destChain.network}
                    addressType={transfer.destChain.supportedAddressTypes?.at(0)}
                    address={transfer.recipient}
                    size={24}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="summary mb-2 w-full space-y-1 px-3">
              <SummaryRow
                label="Amount Sent"
                amount={formatAmount(sourceAmountHuman, 'Long')}
                symbol={transfer.sourceToken.symbol}
                usdValue={formatAmount(sourceAmountUSD, 'Long')}
              />

              {isSwap && transfer.destinationToken && (
                <SummaryRow
                  label="Amount Received"
                  amount={formatAmount(destinationAmountHuman, 'Long')}
                  symbol={transfer.destinationToken.symbol}
                  usdValue={formatAmount(destinationAmountUSD, 'Long')}
                />
              )}

              {Array.isArray(transfer.fees) &&
                transfer.fees.map((fee, index) => (
                  <SummaryRow
                    key={index}
                    label={fee.title}
                    amount={formatAmount(toHuman(fee.amount.amount, fee.amount.token), 'Long')}
                    symbol={fee.amount.token.symbol}
                    usdValue={formatAmount(fee.amount.inDollars, 'Long')}
                  />
                ))}

              <ChainflipRefund
                isSwap={isChainflipSwap(
                  transfer.sourceChain,
                  transfer.destChain,
                  transfer.sourceToken,
                  transfer.destinationToken,
                )}
                className="pt-5 pb-2"
              />

              {explorerLink && (
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View your completed transaction on block explorer"
                  className="!mt-4 mb-4 flex w-full items-center justify-center space-x-2 rounded-lg border border-turtle-level3 px-3 py-1.5 text-sm hover:text-turtle-level5"
                >
                  <p>View on Block Explorer</p> <ArrowUpRight className="hover:text-turtle-level5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
