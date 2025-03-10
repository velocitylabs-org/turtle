import { StoredTransfer } from '@/models/transfer'
import { resolveDirection } from '@/services/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, getExplorerLink, toHuman } from '@/utils/transfer'
import { colors } from '../../tailwind.config'
import Account from './Account'
import { Icon } from './Icon'
import OngoingTransfer from './OngoingTransfer'
import { ArrowRight } from './svg/ArrowRight'
import { ArrowUpRight } from './svg/ArrowUpRight'
import { TokenLogo } from './TokenLogo'
import TransferEstimate from './TransferEstimate'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

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

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <OngoingTransfer transfer={transfer} status={getStatus(status)} direction={direction} />
      </DialogTrigger>
      <DialogContent
        className="ongoing-transfer-dialog m-auto max-h-[85vh] max-w-[90vw] overflow-scroll rounded-4xl sm:max-w-[30.5rem]"
        hideCloseButton={true}
      >
        {/* Modal header */}
        <DialogHeader
          className={
            'flex flex-col items-center justify-center space-y-4 rounded-t-[32px] border border-turtle-secondary-dark bg-turtle-secondary-light py-6'
          }
        >
          <DialogTitle className="sr-only">Ongoing transfer</DialogTitle>
          <DialogDescription className="sr-only">
            Ongoing transfer status and details
          </DialogDescription>
          <div className={'flex items-center justify-center space-x-4 text-turtle-secondary-dark'}>
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={transfer.sourceChain.logoURI}
                width={32}
                height={32}
                className={'rounded-full border border-turtle-secondary-dark bg-background'}
              />
              <div className="text-sm">{transfer.sourceChain.name}</div>
            </div>
            <ArrowRight className="h-3 w-3" fill={colors['turtle-secondary-dark']} />
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <Icon
                src={transfer.destChain.logoURI}
                width={32}
                height={32}
                className={'rounded-full border border-turtle-secondary-dark bg-background'}
              />
              <div className="text-sm">{transfer.destChain.name}</div>
            </div>
          </div>
          <h3
            className={
              'xxl-letter-spacing flex items-center space-x-3 text-3xl leading-none text-turtle-secondary-dark sm:text-5xl'
            }
          >
            <span>{formatAmount(toHuman(transfer.amount, transfer.token))}</span>
            <TokenLogo token={transfer.token} sourceChain={transfer.sourceChain} size={40} />
          </h3>
          <div className={'flex items-center space-x-4 text-sm text-turtle-secondary-dark'}>
            <div>{formatOngoingTransferDate(transfer.date)}</div>
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div className="mt-[-1px] flex w-full flex-1 flex-col items-center gap-4 rounded-b-4xl border border-x-turtle-secondary border-b-turtle-secondary border-t-turtle-secondary-dark bg-white p-4 sm:p-10">
          {/* Update and progress bar */}
          <div
            className={
              'block h-[60px] w-full gap-2 rounded-lg border border-turtle-secondary-dark bg-turtle-secondary-light px-4 text-sm text-turtle-secondary-dark'
            }
          >
            <div className="my-2 flex items-center justify-between">
              <p className="text-left font-bold text-turtle-secondary-dark">{getStatus(status)}</p>
              <p className="text-normal text-turtle-secondary">
                {formatOngoingTransferDate(transfer.date)}
              </p>
            </div>

            <TransferEstimate
              transfer={transfer}
              direction={direction}
              outlinedProgressBar={true}
            />
          </div>

          {/* sender */}
          <div className="relative mt-2 w-full rounded-lg border border-turtle-level3">
            <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
              Sender
            </div>
            <div className="p-4 text-sm">
              <Account
                network={transfer.sourceChain.network}
                addressType={transfer.sourceChain.supportedAddressTypes?.at(0)}
                address={transfer.sender}
                size={24}
              />
            </div>
            <div className="relative border-t p-4 text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
                Receiver
              </div>
              <Account
                network={transfer.destChain.network}
                addressType={transfer.destChain.supportedAddressTypes?.at(0)}
                address={transfer.recipient}
                size={24}
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
                    {formatAmount(toHuman(transfer.amount, transfer.token), 'Long')}{' '}
                    {transfer.token.symbol}
                  </div>
                  <div className="text-turtle-level4">
                    $
                    {formatAmount(
                      toHuman(transfer.amount, transfer.token) * (transfer.tokenUSDValue ?? 0),
                      'Long',
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fees */}
            {/* Execution fee */}
            <div className="flex items-start justify-between space-x-4">
              <div className="font-bold">{transfer.bridgingFee ? 'Execution fee' : 'Fee'}</div>
              <div className="items-right flex flex-col space-x-1 text-right">
                <div className="text-lg">
                  {formatAmount(toHuman(transfer.fees.amount, transfer.fees.token), 'Long')}{' '}
                  {transfer.fees.token.symbol}
                </div>
                <div className="text-turtle-level4">
                  ${formatAmount(transfer.fees.inDollars, 'Long')}
                </div>
              </div>
            </div>

            {/* Bridging fee */}
            {transfer.bridgingFee && (
              <div className="flex items-start justify-between space-x-4">
                <div className="font-bold">Bridging fee</div>
                <div className="items-right flex flex-col space-x-1 text-right">
                  <div className="text-lg">
                    {formatAmount(
                      toHuman(transfer.bridgingFee.amount, transfer.bridgingFee.token),
                      'Long',
                    )}{' '}
                    {transfer.bridgingFee.token.symbol}
                  </div>
                  <div className="text-turtle-level4">
                    ${formatAmount(transfer.bridgingFee.inDollars, 'Long')}
                  </div>
                </div>
              </div>
            )}
          </div>

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
      </DialogContent>
    </Dialog>
  )
}

export default OngoingTransferDialog
