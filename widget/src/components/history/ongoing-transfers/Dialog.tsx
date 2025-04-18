import { StoredTransfer } from '@/models/transfer'
import { Direction, formatAmount, isSwap, resolveDirection, toHuman } from '@/utils/transfer'
import OngoingTransfer from './Card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowRight } from '@/assets/svg/ArrowRight'
import { Icon } from '@/components/Icon'
import { colors } from '../../../../tailwind.config'
import Account from '@/components/Account'
import { TokenLogo } from '@/components/TokenLogo'
import { formatOngoingTransferDate } from '@/utils/datetime'
import TransferEstimate from './OngoingTransferEstimate'
import { getExplorerLink } from '@/utils/explorer'
import { ArrowUpRight } from '@/assets/svg/ArrowUpRight'
import LoadingIcon from '@/assets/svg/LoadingIcon'
import { SummaryRow } from '../completed-transfers/Dialog'

export const OngoingTransferDialog = ({
  transfer,
  status,
}: {
  transfer: StoredTransfer
  status?: string
}) => {
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)
  const explorerLink = getExplorerLink(transfer)

  const getStatus = (status?: string) => {
    if (typeof status === 'string') return status
    if (transfer.status) return transfer.status
    return 'Pending'
  }
  const isFinalTransferStep = getStatus(status)?.includes(transfer.destChain.name)

  const sourceAmountHuman = toHuman(transfer.sourceAmount, transfer.sourceToken)
  const sourceAmountUSD = sourceAmountHuman * (transfer.sourceTokenUSDValue ?? 0)
  const destinationAmountHuman = isSwap(transfer)
    ? toHuman(transfer.destinationAmount, transfer.destinationToken)
    : 0
  const destinationAmountUSD = destinationAmountHuman * (transfer.destinationTokenUSDValue ?? 0)

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <OngoingTransfer transfer={transfer} />
      </DialogTrigger>
      <DialogContent
        className="ongoing-transfer-dialog max-h-[85vh] max-w-[90vw] overflow-scroll rounded-4xl sm:max-w-[27rem]"
        hideCloseButton={true}
      >
        {/* Modal header */}
        <DialogHeader className="flex flex-col gap-2 rounded-tl-4xl rounded-tr-4xl border border-turtle-secondary-dark bg-turtle-secondary-light p-4">
          <DialogTitle className="sr-only">Ongoing transfer</DialogTitle>
          <DialogDescription className="sr-only">
            Ongoing transfer status and details
          </DialogDescription>
          <div className="m-auto flex w-fit items-center justify-center space-x-2 rounded-2xl border border-turtle-secondary-dark bg-turtle-secondary-light px-2 py-1 text-turtle-secondary-dark">
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={transfer.sourceChain.logoURI}
                width={22}
                height={22}
                className="rounded-full border border-turtle-secondary-dark bg-background"
              />
              <div className="text-xs sm:text-sm">{transfer.sourceChain.name}</div>
            </div>
            <ArrowRight className="h-3 w-3" fill={colors['turtle-secondary-dark']} />
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={transfer.destChain.logoURI}
                width={22}
                height={22}
                className="rounded-full border border-turtle-secondary-dark bg-background"
              />
              <div className="text-xs sm:text-sm">{transfer.destChain.name}</div>
            </div>
          </div>
          <h3 className="xxl-letter-spacing flex items-center justify-center space-x-3 text-lg leading-none text-turtle-secondary-dark sm:text-4xl">
            <span>{formatAmount(toHuman(transfer.sourceAmount, transfer.sourceToken))}</span>
            <TokenLogo token={transfer.sourceToken} sourceChain={transfer.sourceChain} size={40} />
            {isSwap(transfer) && (
              <>
                <ArrowRight className="h-3 w-3" fill={colors['turtle-secondary-dark']} />
                <span>{formatAmount(destinationAmountHuman, 'Long')}</span>
                <TokenLogo
                  token={transfer.destinationToken}
                  sourceChain={transfer.destChain}
                  size={35}
                />
              </>
            )}
          </h3>
          <div
            className={
              'flex items-center justify-center space-x-4 text-xs text-turtle-secondary-dark'
            }
          >
            <div>{formatOngoingTransferDate(transfer.date)}</div>
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div className="mt-[-1px] flex w-full flex-1 flex-col items-center gap-4 rounded-b-4xl border border-x-turtle-secondary border-b-turtle-secondary border-t-turtle-secondary-dark bg-white p-4">
          {/* Update and progress bar */}
          <div
            className={
              'block w-full gap-2 rounded-lg border border-turtle-secondary-dark bg-turtle-secondary-light px-4 text-sm text-turtle-secondary-dark'
            }
          >
            {direction !== Direction.WithinPolkadot ? (
              <>
                <div className="my-2 flex items-center">
                  <p className="text-left font-bold text-turtle-secondary-dark">
                    {getStatus(status)}
                  </p>
                </div>
                <TransferEstimate
                  transfer={transfer}
                  direction={direction}
                  outlinedProgressBar={false}
                />
              </>
            ) : (
              <>
                <div className="my-2 flex items-center">
                  {!isFinalTransferStep && (
                    <LoadingIcon
                      className="mr-2 animate-spin"
                      width={24}
                      height={24}
                      strokeWidth={5}
                      color={colors['turtle-secondary']}
                    />
                  )}
                  <p className="text-left font-bold text-turtle-secondary-dark">
                    {getStatus(status)}
                  </p>
                </div>

                {isFinalTransferStep && (
                  <TransferEstimate
                    transfer={transfer}
                    direction={direction}
                    outlinedProgressBar={false}
                  />
                )}
              </>
            )}
          </div>

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
          <div className="summary my-3 w-full space-y-3 px-1">
            <SummaryRow
              label="Amount Sent"
              amount={formatAmount(sourceAmountHuman, 'Long')}
              symbol={transfer.sourceToken.symbol}
              usdValue={formatAmount(sourceAmountUSD, 'Long')}
            />

            {isSwap(transfer) && (
              <SummaryRow
                label="Amount Received"
                amount={formatAmount(destinationAmountHuman, 'Long')}
                symbol={transfer.destinationToken.symbol}
                usdValue={formatAmount(destinationAmountUSD, 'Long')}
              />
            )}

            <SummaryRow
              label={transfer.bridgingFee ? 'Execution fee' : 'Fee'}
              amount={formatAmount(toHuman(transfer.fees.amount, transfer.fees.token), 'Long')}
              symbol={transfer.fees.token.symbol}
              usdValue={formatAmount(transfer.fees.inDollars, 'Long')}
            />

            {transfer.bridgingFee && (
              <SummaryRow
                label="Bridging fee"
                amount={formatAmount(
                  toHuman(transfer.bridgingFee.amount, transfer.bridgingFee.token),
                  'Long',
                )}
                symbol={transfer.bridgingFee.token.symbol}
                usdValue={formatAmount(transfer.bridgingFee.inDollars, 'Long')}
              />
            )}

            {explorerLink && (
              <a
                href={explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View transaction on block explorer"
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

export default OngoingTransferDialog
