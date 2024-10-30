import { SnowbridgeStatus } from '@/models/snowbridge'
import { StoredTransfer } from '@/models/transfer'
import { resolveDirection } from '@/services/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, getExplorerLink, toHuman } from '@/utils/transfer'
import Image from 'next/image'
import { colors } from '../../tailwind.config'
import Account from './Account'
import OngoingTransfer from './OngoingTransfer'
import { ArrowRight } from './svg/ArrowRight'
import { ArrowUpRight } from './svg/ArrowUpRight'
import TransferEstimate from './TransferEstimate'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Separator } from './ui/separator'

export const OngoingTransferDialog = ({
  transfer,
  transferStatus = 'Loading...',
  estimatedTransferDuration,
}: {
  transfer: StoredTransfer
  transferStatus?: string
  estimatedTransferDuration?: SnowbridgeStatus
}) => {
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)
  const explorerLink = getExplorerLink(transfer)

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <OngoingTransfer
          transfer={transfer}
          transferStatus={transferStatus}
          estimatedTransferDuration={estimatedTransferDuration}
          direction={direction}
        />
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
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={transfer.sourceChain.logoURI}
                  alt={`${transfer.sourceChain.name}`}
                  fill={true}
                  className={'rounded-full border border-turtle-secondary-dark bg-background'}
                />
              </div>
              <div className="text-sm">{transfer.sourceChain.name}</div>
            </div>
            <ArrowRight className="h-3 w-3" fill={colors['turtle-secondary-dark']} />
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={transfer.destChain.logoURI}
                  alt={`${transfer.destChain.name}`}
                  fill={true}
                  className={'rounded-full border border-turtle-secondary-dark bg-background'}
                />
              </div>
              <div className="text-sm">{transfer.destChain.name}</div>
            </div>
          </div>
          <h3
            className={
              'xxl-letter-spacing flex items-center space-x-1 text-3xl leading-none text-turtle-secondary-dark sm:text-5xl'
            }
          >
            <span>{formatAmount(toHuman(transfer.amount, transfer.token))}</span>
            <span>{transfer.token.symbol}</span>
          </h3>
          <div className={'flex items-center space-x-4 text-sm text-turtle-secondary-dark'}>
            <div>{formatOngoingTransferDate(transfer.date)}</div>
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div className="flex w-full flex-1 flex-col items-center gap-4 rounded-b-4xl border border-x-turtle-secondary border-b-turtle-secondary bg-white p-4 sm:p-10">
          {/* Update and progress bar */}
          <div
            className={
              'block h-[60px] w-full gap-2 rounded-lg border border-turtle-secondary-dark bg-turtle-secondary-light px-4 text-sm text-turtle-secondary-dark'
            }
          >
            <div className="my-2 flex items-center justify-between">
              <p className="text-left font-bold text-turtle-secondary-dark">{transferStatus}</p>
              <p className="text-normal text-turtle-secondary">
                {formatOngoingTransferDate(transfer.date)}
              </p>
            </div>

            <TransferEstimate
              transfer={transfer}
              estimatedTransferDuration={estimatedTransferDuration}
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
              <Account network={transfer.sourceChain.network} address={transfer.sender} />
            </div>
            <div className="relative border-t p-4 text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
                Receiver
              </div>
              <Account network={transfer.destChain.network} address={transfer.recipient} />
            </div>
          </div>

          {/* fees */}
          <div className="w-full gap-10">
            <div className="mt-2 flex justify-between space-x-4 px-1 sm:flex-row">
              <p className="text-sm">Transfer amount</p>
              <div className="flex space-x-1 text-sm">
                <p>{toHuman(transfer.amount, transfer.token)}</p>
                <p>{transfer.token.symbol}</p>
                {typeof transfer.tokenUSDValue == 'number' && (
                  <p className="text-turtle-level5">
                    $
                    {formatAmount(
                      toHuman(transfer.amount, transfer.token) * (transfer.tokenUSDValue ?? 0),
                    )}{' '}
                  </p>
                )}
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex justify-between space-x-4 px-1 sm:flex-row">
              <p className="text-sm">Fees</p>
              <div className="flex space-x-1 text-sm">
                <p>{formatAmount(toHuman(transfer.fees.amount, transfer.fees.token))}</p>
                <p>{transfer.fees.token.symbol}</p>
                {transfer.fees.inDollars >= 0 && (
                  <div className="text-turtle-level5">${formatAmount(transfer.fees.inDollars)}</div>
                )}
              </div>
            </div>
            {/* <Separator className="my-4 bg-turtle-level3" />
            <div className="flex justify-between space-x-4 px-1 sm:flex-row">
              <p className="text-sm">Min receive</p>
              <div className="flex space-x-1 text-sm">
                <p>{formatAmount(toHuman(transfer.amount, transfer.token))}</p>
                <p>{transfer.token.symbol}</p>
                {typeof transfer.tokenUSDValue == 'number' && (
                  <p className="text-turtle-level5">
                    $
                    {formatAmount(
                      toHuman(transfer.amount, transfer.token) * (transfer.tokenUSDValue ?? 0),
                    )}{' '}
                  </p>
                )}
              </div>
            </div> */}
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
