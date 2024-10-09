import Image from 'next/image'
import Link from 'next/link'

import { TxStatus, CompletedTransfer } from '@/models/transfer'
import { cn } from '@/utils/cn'
import { formatCompletedTransferDate, formatHours } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'

import { TransactionCard } from './TransactionCard'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

import Account from '../Account'
import { Separator } from '../ui/separator'
import { ArrowRight } from '../svg/ArrowRight'
import { ArrowUpRight } from '../svg/ArrowUpRight'
import { ExclamationMark } from '../svg/ExclamationMark'

import { colors } from '../../../tailwind.config'

export const TransactionDialog = ({ tx }: { tx: CompletedTransfer }) => {
  const transferSucceeded = tx.result === TxStatus.Succeeded

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
            'flex flex-col items-center justify-center space-y-6 rounded-t-4xl border py-5 sm:py-10',
            transferSucceeded
              ? 'border-turtle-success-dark bg-turtle-success-light'
              : 'border-turtle-error-dark bg-turtle-error-light ',
          )}
        >
          <DialogTitle className="sr-only">Completed transfer</DialogTitle>
          <DialogDescription className="sr-only">
            Completed transfer status and details
          </DialogDescription>
          <div
            className={cn(
              'flex items-center justify-center space-x-4',
              transferSucceeded ? ' text-turtle-success-dark' : 'text-turtle-error-dark ',
            )}
          >
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={tx.sourceChain.logoURI}
                  alt={`${tx.sourceChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border bg-background',
                    transferSucceeded ? 'border-turtle-success-dark' : 'border-turtle-error-dark ',
                  )}
                />
              </div>
              <div className="text-sm">{tx.sourceChain.name}</div>
            </div>
            <ArrowRight
              className="h-3 w-3"
              {...(!transferSucceeded
                ? { fill: colors['turtle-error-dark'] }
                : { fill: colors['turtle-primary-dark'] })}
            />
            <div className="turtle-success-dark flex items-center space-x-1">
              <div className="relative h-6 w-6 rounded-full">
                <Image
                  src={tx.destChain.logoURI}
                  alt={`${tx.destChain.name}`}
                  fill={true}
                  className={cn(
                    'rounded-full border bg-background',
                    transferSucceeded ? 'border-turtle-success-dark' : 'border-turtle-error-dark ',
                  )}
                />
              </div>
              <div className="text-sm">{tx.destChain.name}</div>
            </div>
          </div>
          <h3
            className={cn(
              'xxl-letter-spacing flex items-center space-x-1 text-3xl leading-none sm:text-5xl',
              transferSucceeded ? 'text-turtle-success-dark' : ' text-turtle-error-dark',
            )}
          >
            <span>{formatAmount(toHuman(tx.amount, tx.token))}</span>
            <span>{tx.token.symbol}</span>
          </h3>
          <div
            className={cn(
              'flex items-center space-x-4 text-sm',
              transferSucceeded ? 'text-turtle-success-dark' : ' text-turtle-error-dark',
            )}
          >
            <div>{formatCompletedTransferDate(tx.date)}</div>
            <div>{formatHours(tx.date)}</div>
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div className="flex w-full flex-1 flex-col items-center gap-4 rounded-b-4xl border border-x-turtle-secondary border-b-turtle-secondary bg-white p-4 sm:p-10">
          <div
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-2 py-4 text-sm',
              transferSucceeded
                ? 'border-turtle-success-dark bg-turtle-success-light text-turtle-success-dark'
                : 'border-turtle-error-dark bg-turtle-error-light text-turtle-error-dark',
            )}
          >
            <ExclamationMark {...(!transferSucceeded && { fill: colors['turtle-error-dark'] })} />
            {transferSucceeded ? (
              <p>
                <span className="pe-0.5 font-semibold">Done!</span>
                This transfer is completed.
              </p>
            ) : (
              <p className="w-5/6 space-x-0.5">
                <span className="font-semibold">This transfer failed!</span>
                {tx.errors?.length && tx.errors[tx.errors?.length - 1]}
                <Link href={'/'} className="underline hover:text-turtle-error">
                  Try it again
                </Link>
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
                address={tx.sender}
                className={transferSucceeded ? 'border-black' : 'border-turtle-error-dark'}
              />
            </div>

            <div className="relative border-t p-4 text-sm">
              <div className="absolute -top-2 left-2.5 bg-white px-0.5 text-xs text-turtle-level5">
                Receiver
              </div>
              <Account
                network={tx.destChain.network}
                address={tx.recipient}
                className={transferSucceeded ? 'border-black' : 'border-turtle-error-dark'}
              />
            </div>
          </div>

          {/* fees */}
          <div className="w-full gap-10">
            <div className="flex flex-row items-center justify-between space-x-4 px-1">
              <p className="text-sm">Transfer amount</p>
              <div className="flex space-x-1 text-sm">
                <p>{toHuman(tx.amount, tx.token)}</p>
                <p>{tx.token.symbol}</p>
                {typeof tx.tokenUSDValue == 'number' && (
                  <p className="text-turtle-level5">
                    ${formatAmount(toHuman(tx.amount, tx.token) * (tx.tokenUSDValue ?? 0))}
                  </p>
                )}
              </div>
            </div>
            <Separator className="my-4 bg-turtle-level3" />
            <div className="flex flex-row items-center justify-between px-1">
              <p className="text-sm">Fees</p>
              <div className="flex space-x-1 text-sm">
                <p>{formatAmount(toHuman(tx.fees.amount, tx.fees.token))}</p>
                <p>{tx.fees.token.symbol}</p>
                {tx.fees.inDollars > 0 && (
                  <div className="text-turtle-level5">${formatAmount(tx.fees.inDollars)}</div>
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
