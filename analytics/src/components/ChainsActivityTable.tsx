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
  totalVolume: number
  totalTransactions: number
}

interface ChainsActivityTable {
  chains: ChainsActivityItem[]
  isLoading: boolean
}

type SortColumn = 'chainUid' | 'network' | 'totalVolume' | 'totalTransactions'
type SortDirection = 'asc' | 'desc'

export default function ChainsActivityTable({
  chains: initialChains,
  isLoading,
}: ChainsActivityTable) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('totalVolume')
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

      if (sortColumn === 'network') {
        const networkA = chainsByUid[a.chainUid]?.network || ''
        const networkB = chainsByUid[b.chainUid]?.network || ''
        return networkA.localeCompare(networkB) * modifier
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
                column="network"
                label="Network"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <SortableColumnHeader
                column="totalVolume"
                label="Volume (USD)"
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <SortableColumnHeader
                column="totalTransactions"
                label="Transactions"
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
        <TableCell>{chain.network}</TableCell>
        <TableCell>${formatUSD(item.totalVolume)}</TableCell>
        <TableCell>{item.totalTransactions}</TableCell>
      </TableRow>
    )
  })
}
