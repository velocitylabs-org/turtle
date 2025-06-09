'use client'
import { chainsByUid } from '@velocitylabs-org/turtle-registry'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { LogoImg } from '@/components/TokenAndOriginLogos'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import formatUSD from '@/utils/format-USD'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

type ChainsActivityItem = {
  chainUid: string
  incomingTransactions: number
  incomingVolume: number
  outgoingTransactions: number
  outgoingVolume: number
}

interface ChainsActivityTable {
  chains: ChainsActivityItem[]
  isLoading: boolean
}

type SortColumn =
  | 'chainUid'
  | 'incomingTransactions'
  | 'incomingVolume'
  | 'outgoingTransactions'
  | 'outgoingVolume'
type SortDirection = 'asc' | 'desc'

export default function ChainsActivityTable({
  chains: initialChains,
  isLoading,
}: ChainsActivityTable) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('outgoingVolume')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const chains = useMemo(() => {
    if (isLoading || initialChains.length === 0) return initialChains

    return [...initialChains].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1

      // Handle string columns
      if (sortColumn === 'chainUid') {
        const chainA = chainsByUid[a.chainUid]?.name || ''
        const chainB = chainsByUid[b.chainUid]?.name || ''
        return chainA.localeCompare(chainB) * modifier
      }

      // Handle numeric columns
      return (a[sortColumn] - b[sortColumn]) * modifier
    })
  }, [initialChains, sortColumn, sortDirection, isLoading])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableColumnHeader
                column="chainUid"
                label="Chains"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <SortableColumnHeader
                column="incomingVolume"
                label="Incoming volume (USD)"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <SortableColumnHeader
                column="incomingTransactions"
                label="Incoming transactions"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <SortableColumnHeader
                column="outgoingVolume"
                label="Outgoing volume (USD)"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <SortableColumnHeader
                column="outgoingTransactions"
                label="Outgoing transactions"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <ChainsTableContent chains={chains} isLoading={isLoading} />
        </TableBody>
      </Table>
    </div>
  )
}

interface SortableColumnHeaderProps {
  column: SortColumn
  label: string
  currentSortColumn: SortColumn
  currentSortDirection: SortDirection
  onSort: (column: SortColumn) => void
}

const SortableColumnHeader = ({
  column,
  label,
  currentSortColumn,
  currentSortDirection,
  onSort,
}: SortableColumnHeaderProps) => (
  <span className="relative">
    <button className="pr-3 font-medium hover:text-primary" onClick={() => onSort(column)}>
      {label}
    </button>
    {currentSortColumn === column && (
      <span className="absolute right-[-15px]" onClick={() => onSort(column)} role="button">
        {currentSortDirection === 'asc' ? (
          <ChevronUp className="h-5 w-5 text-primary" />
        ) : (
          <ChevronDown className="h-5 w-5 text-primary" />
        )}
      </span>
    )}
  </span>
)

interface ChainsTableContentProps {
  chains: ChainsActivityItem[]
  isLoading: boolean
}

function ChainsTableContent({ chains, isLoading }: ChainsTableContentProps) {
  if (isLoading) {
    return (
      <TableRow key={0}>
        <TableCell colSpan={6} className="text-center">
          <div
            className="flex items-center justify-center"
            style={{ height: 'calc(100vh - 300px)' }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  if (chains.length === 0) {
    return (
      <TableRow key={1}>
        <TableCell colSpan={6} className="text-center">
          <div
            className="flex items-center justify-center"
            style={{ height: 'calc(100vh - 300px)' }}
          >
            <p>There are no recent chains activity to display</p>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return chains.map((item, i) => {
    const chain = chainsByUid[item.chainUid]
    const logoUrl = getSrcFromLogo(chain)

    return (
      <TableRow key={`${item.chainUid}-${i}`}>
        <TableCell>
          <div className="inline-flex items-center">
            <LogoImg logoURI={logoUrl} size={28} className="border border-black" />
            <div className="ml-2 flex flex-col">
              <span className="text-xs text-muted-foreground">{chain.name}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>${formatUSD(item.incomingVolume)}</TableCell>
        <TableCell>{item.incomingTransactions}</TableCell>
        <TableCell>${formatUSD(item.outgoingVolume)}</TableCell>
        <TableCell>{item.outgoingTransactions}</TableCell>
      </TableRow>
    )
  })
}
