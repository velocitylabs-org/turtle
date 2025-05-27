'use client'
import { tokensById, chainsByUid } from '@velocitylabs-org/turtle-registry'
import { getOriginBadge } from '@velocitylabs-org/turtle-ui'
import { Ban, CheckCircle, CircleHelp } from 'lucide-react'
import React from 'react'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TxStatus } from '@/models/Transaction'
import { TransactionView } from '@/models/transaction-view'
import formatUSD from '@/utils/format-USD'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

interface RecentTransactionsTableProps {
  transactions: TransactionView[]
  isLoading: boolean
}

export default function RecentTransactionsTable({
  transactions,
  isLoading,
}: RecentTransactionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow key={0}>
              <TableCell colSpan={6} className="text-center">
                <div className="flex h-[250px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow key={1}>
              <TableCell colSpan={6} className="text-center">
                <div className="flex h-[250px] items-center justify-center">
                  <p>There are no recent transactions to display</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx, i) => (
              <TableRow key={`${tx.txDate}${i}`}>
                <TableCell>
                  <div className="flex items-center">
                    <TokenChainDisplay tokenId={tx.sourceTokenId} chainUid={tx.sourceChainUid} />
                    <div className="ml-2 flex flex-col">
                      <span className="font-medium">{tx.sourceTokenSymbol}</span>
                      <span className="text-xs text-muted-foreground">{tx.sourceChainName}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{tx.sourceTokenAmount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">
                      (${formatUSD(tx.sourceTokenAmountUsd)})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <TokenChainDisplay
                      tokenId={tx.destinationTokenId}
                      chainUid={tx.destinationChainUid}
                    />
                    <div className="ml-2 flex flex-col">
                      <span className="font-medium">{tx.destinationTokenSymbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {tx.destinationChainName}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    {new Date(tx.txDate).toLocaleString('en-GB', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      hour12: false,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <TransactionStatusIndicator status={tx.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface TransactionStatusIndicatorProps {
  status: TxStatus
}

function TransactionStatusIndicator({ status }: TransactionStatusIndicatorProps) {
  switch (status) {
    case 'succeeded':
      return (
        <div className="flex flex-col items-center">
          <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
          <span className="text-xs">Succeeded</span>
        </div>
      )
    case 'failed':
      return (
        <div className="flex flex-col items-center">
          <Ban className="mr-1 h-4 w-4 text-red-500" />
          <span className="text-xs">Failed</span>
        </div>
      )
    case 'undefined':
      return (
        <div className="flex flex-col items-center">
          <CircleHelp className="mr-1 h-4 w-4 text-yellow-500" />
          <span className="text-xs">Undefined</span>
        </div>
      )
    default:
      return null
  }
}

interface TokenChainDisplayProps {
  tokenId: string
  chainUid: string
  size?: number
}

export function TokenChainDisplay({ tokenId, chainUid, size = 28 }: TokenChainDisplayProps) {
  const token = tokensById[tokenId]
  const sourceChain = chainsByUid[chainUid]
  const originBadge = getOriginBadge(token, sourceChain)
  const originBadgeURI = originBadge && getSrcFromLogo(originBadge)
  const tokenURI = getSrcFromLogo(token)

  return <TokenAndOriginLogos tokenURI={tokenURI} originURI={originBadgeURI} size={size} />
}
