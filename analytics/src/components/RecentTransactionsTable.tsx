'use client'
import Link from 'next/link'
import React from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TransactionView } from '@/models/transaction-view'
import { formatDate } from '@/utils/format-date'
import formatUSD from '@/utils/format-USD'
import { TokenChainDisplay } from './TokenChainDisplay'
import { TransactionStatusIndicator } from './TransactionStatusIndicator'

interface RecentTransactionsTableProps {
  transactions: TransactionView[]
  isLoading: boolean
}

export default function RecentTransactionsTable({
  transactions,
  isLoading,
}: RecentTransactionsTableProps) {
  const { start } = useLoadingBar()

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
                <div className="flex h-[450px] items-center justify-center">
                  <p>There are no recent transactions to display</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map(tx => (
              <TableRow key={tx._id} className="hover:bg-muted/50">
                <Link
                  href={`/tx-detail/${tx._id}`}
                  className="contents cursor-pointer"
                  prefetch
                  onClick={() => start()}
                >
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
                      <span>{tx.sourceTokenAmount}</span>
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
                      {formatDate(tx.txDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TransactionStatusIndicator status={tx.status} />
                  </TableCell>
                </Link>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
