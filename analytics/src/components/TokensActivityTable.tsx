'use client'
import { tokensById } from '@velocitylabs-org/turtle-registry'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import React, { useMemo } from 'react'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import formatUSD from '@/utils/format-USD'
import getTypeBadge from '@/utils/get-type-badge'

type TokensActivityItem = {
  tokenId: string
  totalVolume: number
  totalTransactions: number
}

interface TokensActivityTable {
  tokens: TokensActivityItem[]
  isLoading: boolean
}

type SortColumn = 'tokenId' | 'network' | 'totalVolume' | 'totalTransactions'

const sortColumnQueryDefault = parseAsStringLiteral([
  'tokenId',
  'network',
  'totalVolume',
  'totalTransactions',
] as const).withDefault('totalVolume')
const sortDirectionQueryDefault = parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc')

export default function TokensActivityTable({
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

      if (sortColumn === 'network') {
        const networkA = tokensById[a.tokenId]?.origin.type || ''
        const networkB = tokensById[b.tokenId]?.origin.type || ''
        return networkA.localeCompare(networkB) * modifier
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

  if (tokens.length === 0) {
    return (
      <TableRow key={1}>
        <TableCell colSpan={6} className="text-center">
          <div
            className="flex items-center justify-center"
            style={{ height: 'calc(100vh - 300px)' }}
          >
            <p>There are no recent token activity to display</p>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return tokens.map((item, i) => {
    const token = tokensById[item.tokenId]
    const { logoURI, typeURI } = getTypeBadge(item.tokenId)

    return (
      <TableRow key={`${item.tokenId}-${i}`}>
        <TableCell>
          <div className="inline-flex items-center">
            <TokenAndOriginLogos
              tokenURI={logoURI as string}
              originURI={typeURI as string}
              size={28}
            />
            <div className="ml-2 flex flex-col">
              <span className="font-medium">{token?.symbol || 'Unknown Token'}</span>
              <span className="text-xs text-muted-foreground">{token?.name || ''}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>{token.origin.type}</TableCell>
        <TableCell>${formatUSD(item.totalVolume)}</TableCell>
        <TableCell>{item.totalTransactions}</TableCell>
      </TableRow>
    )
  })
}
