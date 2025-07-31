'use client'
import Link from 'next/link'
import React from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SwapView } from '@/models/swap-view'
import { formatDate, formatDateAgo } from '@/utils/format-date'
import formatUSD from '@/utils/format-USD'
import { TokenChainDisplay } from './TokenChainDisplay'
import { TransactionStatusIndicator } from './TransactionStatusIndicator'

interface RecentSwapsTableProps {
  swaps: SwapView[]
  isLoading: boolean
}

export default function RecentSwapsTable({ swaps, isLoading }: RecentSwapsTableProps) {
  const { start } = useLoadingBar()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow key={0}>
              <TableCell colSpan={6} className="text-center">
                <div className="flex h-[450px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : swaps.length === 0 ? (
            <TableRow key={1}>
              <TableCell colSpan={6} className="text-center">
                <div className="flex h-[250px] items-center justify-center">
                  <p>There are no transactions to display</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            swaps.map(swap => (
              <TableRow key={swap._id} className="hover:bg-muted/50">
                <Link href={`/detail/${swap._id}`} className="contents cursor-pointer" prefetch onClick={() => start()}>
                  <TableCell>
                    <div className="flex items-center">
                      <TokenChainDisplay tokenId={swap.sourceTokenId} chainUid={swap.sourceChainUid} />
                      <div className="ml-2 flex flex-col">
                        <span className="font-medium">{swap.sourceTokenSymbol}</span>
                        <span className="text-xs text-muted-foreground">{swap.sourceChainName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{swap.sourceTokenAmount}</span>
                      <span className="text-xs text-muted-foreground">(${formatUSD(swap.sourceTokenAmountUsd)})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <TokenChainDisplay tokenId={swap.destinationTokenId} chainUid={swap.destinationChainUid} />
                      <div className="ml-2 flex flex-col">
                        <span className="font-medium">{swap.destinationTokenSymbol}</span>
                        <span className="text-xs text-muted-foreground">{swap.destinationChainName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{swap.destinationTokenAmount}</span>
                      <span className="text-xs text-muted-foreground">
                        (${formatUSD(swap.destinationTokenAmountUsd)})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="text-sm">{formatDate(swap.txDate)}</div>
                      <div className="text-sm text-muted-foreground">{formatDateAgo(swap.txDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TransactionStatusIndicator status={swap.status} />
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
