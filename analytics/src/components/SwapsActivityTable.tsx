'use client'
import { tokensById } from '@velocitylabs-org/turtle-registry'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import React, { useMemo } from 'react'
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

type TokensActivityItem = {
  tokenId: string
  incomingTransactions: number
  incomingVolume: number
  outgoingTransactions: number
  outgoingVolume: number
  totalTransactions: number
  totalVolume: number
}

interface TokensActivityTable {
  tokens: TokensActivityItem[]
  isLoading: boolean
}

const sortColumnOptions = [
  'tokenId',
  'incomingTransactions',
  'incomingVolume',
  'outgoingTransactions',
  'outgoingVolume',
] as const
type SortColumn = (typeof sortColumnOptions)[number]

const sortDirectionsOptions = ['asc', 'desc'] as const

const sortColumnQueryDefault = parseAsStringLiteral(sortColumnOptions).withDefault('outgoingVolume')
const sortDirectionQueryDefault = parseAsStringLiteral(sortDirectionsOptions).withDefault('desc')

export default function SwapsActivityTable({
  tokens: initialTokens,
  isLoading,
}: TokensActivityTable) {
  const [sortColumn, setSortColumn] = useQueryState('sortColumn', sortColumnQueryDefault)
  const [sortDirection, setSortDirection] = useQueryState(
    'sortDirection',
    sortDirectionQueryDefault,
  )

  const tokens = useMemo(() => {
    if (isLoading || initialTokens.length === 0) return initialTokens

    return [...initialTokens].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1

      // Handle string columns
      if (sortColumn === 'tokenId') {
        const tokenA = tokensById[a.tokenId]?.symbol || ''
        const tokenB = tokensById[b.tokenId]?.symbol || ''
        return tokenA.localeCompare(tokenB) * modifier
      }

      // Handle numeric columns
      const valueA = a[sortColumn as keyof typeof a] as number
      const valueB = b[sortColumn as keyof typeof b] as number
      return (valueA - valueB) * modifier
    })
  }, [initialTokens, sortColumn, sortDirection, isLoading])

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
                column="tokenId"
                label="Token"
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
          <TokensTableContent tokens={tokens} isLoading={isLoading} />
        </TableBody>
      </Table>
    </div>
  )
}

interface SortableColumnHeaderProps {
  column: SortColumn
  label: string
  currentSortColumn: string
  currentSortDirection: string
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

interface TokensTableContentProps {
  tokens: TokensActivityItem[]
  isLoading: boolean
}

function TokensTableContent({ tokens, isLoading }: TokensTableContentProps) {
  if (isLoading) {
    return (
      <TableRow key={0}>
        <TableCell colSpan={5} className="text-center">
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

  if (tokens.length === 0) {
    return (
      <TableRow key={1}>
        <TableCell colSpan={5} className="text-center">
          <div
            className="flex items-center justify-center"
            style={{ height: 'calc(100vh - 300px)' }}
          >
            <p>There are no recent tokens activity to display</p>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return tokens.map((item, i) => {
    const token = tokensById[item.tokenId]
    const logoUrl = getSrcFromLogo(token)

    return (
      <TableRow key={`${item.tokenId}-${i}`}>
        <TableCell>
          <div className="inline-flex items-center">
            <LogoImg logoURI={logoUrl} size={28} className="border border-black" />
            <div className="ml-2 flex flex-col">
              <span className="font-medium">{token.symbol}</span>
              <span className="text-xs text-muted-foreground">{token.name}</span>
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
