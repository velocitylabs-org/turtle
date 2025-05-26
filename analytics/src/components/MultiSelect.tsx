'use client'
import { Token } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import React from 'react'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Option = {
  value: string
  label: string
  logoURI: Token['logoURI']
  originLogoURI?: Token['logoURI']
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[] | ((prev: string[]) => string[])) => void
  placeholder?: string
  className?: string
  singleSelect?: boolean
  showImagesInBadges?: boolean
  disabled?: boolean
}

export default function StandardMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className,
  singleSelect = false,
  showImagesInBadges = true,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSelect = (value: string) => {
    if (disabled) return

    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value))
    } else if (singleSelect) {
      onChange([value])
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    if (disabled) return
    onChange(selected.filter(item => item !== value))
  }

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className={cn('relative', className)}>
      <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-auto min-h-10 w-full justify-between py-1',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap items-center gap-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map(value => {
                  const option = options.find(opt => opt.value === value)
                  return (
                    <Badge key={value} variant="secondary" className="mr-1 px-1 py-0">
                      <div className="flex items-center">
                        {showImagesInBadges &&
                          renderImage(option?.logoURI as string, option?.originLogoURI as string)}
                        <span>{option?.label || value}</span>
                        {!disabled && (
                          <button
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={e => {
                              e.stopPropagation()
                              handleRemove(value)
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            <span className="sr-only">Remove {option?.label || value}</span>
                          </button>
                        )}
                      </div>
                    </Badge>
                  )
                })
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm">No results found.</div>
              ) : (
                <div className="overflow-hidden p-1 text-foreground">
                  <div className="max-h-64 overflow-auto">
                    {filteredOptions.map(option => (
                      <div
                        key={option.value}
                        className={cn(
                          'relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
                          selected.includes(option.value) ? 'bg-accent text-accent-foreground' : '',
                          !disabled &&
                            'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                          disabled && 'cursor-not-allowed opacity-50',
                        )}
                        onClick={() => !disabled && handleSelect(option.value)}
                      >
                        <Check
                          className={cn(
                            'h-4 w-4',
                            selected.includes(option.value) ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {renderImage(option.logoURI as string, option?.originLogoURI as string)}
                        {option.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function renderImage(logoURI?: string, originLogoURI?: string) {
  if (!logoURI) return null

  return (
    <div className="relative mr-1 flex-shrink-0" style={{ top: originLogoURI ? 1 : 2 }}>
      <TokenAndOriginLogos tokenURI={logoURI} originURI={originLogoURI} size={20} />
    </div>
  )
}
