'use client'
import { cn } from '@velocitylabs-org/turtle-ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  canGoPrev: boolean
  canGoNext: boolean
  pageNumbers: number[]
  PaginationComponent: React.FC<PaginationComponentProps>
}

interface PaginationComponentProps {
  className?: string
  showPageInput?: boolean
}

export function usePagination({
  totalItems,
  itemsPerPage,
  currentPage: controlledPage,
  onPageChange,
}: UsePaginationProps): UsePaginationReturn {
  const [internalPage, setInternalPage] = useState(1)
  const currentPage = controlledPage ?? internalPage
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const setPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, totalPages))
      if (controlledPage === undefined) {
        setInternalPage(newPage)
      }
      onPageChange?.(newPage)
    },
    [controlledPage, totalPages, onPageChange],
  )

  const nextPage = useCallback(() => {
    setPage(currentPage + 1)
  }, [currentPage, setPage])

  const prevPage = useCallback(() => {
    setPage(currentPage - 1)
  }, [currentPage, setPage])

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const pageNumbers = useMemo(() => {
    const delta = 2 // Number of pages to show around current page
    const range: number[] = []
    const rangeWithDots: number[] = []
    let l: number | undefined // Track last processed page number

    // Build array of page numbers to display
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    // Add dots where there are gaps in the sequence
    range.forEach(i => {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1) // Fill single gap (no dots needed)
        } else if (i - l !== 1) {
          rangeWithDots.push(-1) // Add dots indicator for larger gaps
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }, [currentPage, totalPages])

  const PaginationComponent: React.FC<PaginationComponentProps> = ({
    className,
    showPageInput = true,
  }) => {
    const [inputValue, setInputValue] = useState('')

    if (totalPages <= 1) return null

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '')
      setInputValue(value)
    }

    const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const pageNumber = parseInt(inputValue)
        if (pageNumber && pageNumber >= 1 && pageNumber <= totalPages) {
          setPage(pageNumber)
          setInputValue('')
        }
      }
    }

    return (
      <div className={cn('flex items-center justify-between gap-2', className)}>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={!canGoPrev}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((pageNumber, idx) => {
            if (pageNumber === -1) {
              return (
                <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            return (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(pageNumber)}
                className={cn('h-8 w-8 p-0', {
                  'pointer-events-none bg-gray-100 text-black hover:bg-gray-100':
                    pageNumber === currentPage,
                })}
              >
                {pageNumber}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={!canGoNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {showPageInput && (
            <div className="flex items-center gap-1">
              <span>Go to:</span>
              <Input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputSubmit}
                placeholder="#"
                className="h-6 w-12 px-1 text-center text-xs"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return {
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    canGoPrev,
    canGoNext,
    pageNumbers,
    PaginationComponent,
  }
}
