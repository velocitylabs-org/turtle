'use client'
import { Token } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import React from 'react'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Option = {
  value: string
  label: string
  logoURI?: Token['logoURI']
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
  preventEmpty?: boolean
  showBadges?: boolean
  minimal?: boolean
  loading?: boolean
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
  preventEmpty = false,
  showBadges = true,
  minimal,
  loading,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (disabled || loading) return

    if (selected.includes(value)) {
      // If preventEmpty is true and there's only one item selected, don't remove it
      if (preventEmpty && selected.length === 1) {
        return
      }
      onChange(selected.filter(item => item !== value))
    } else if (singleSelect) {
      onChange([value])
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    if (disabled || loading) return
    onChange(selected.filter(item => item !== value))
  }

  const showRemoveButton = !disabled && !preventEmpty && !loading

  return (
    <div className={cn('relative', className)}>
      <Popover
        open={disabled ? false : open}
        onOpenChange={disabled || loading ? undefined : setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant={minimal ? 'ghost' : 'outline'}
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-auto min-h-10 w-full justify-between py-1',
              disabled && 'cursor-not-allowed opacity-50',
              minimal && 'm-0 border-0 p-0 hover:bg-transparent',
            )}
            disabled={disabled}
          >
            <div className={cn('flex flex-wrap items-center', minimal && 'flex-grow')}>
              {loading ? (
                <div className="ml-3 flex flex-grow items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary" />
                </div>
              ) : selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map(value => {
                  const option = options.find(opt => opt.value === value)
                  return (
                    <Badge
                      key={value}
                      variant="secondary"
                      className={cn(
                        'mr-1 px-1 py-0',
                        !showBadges && '!important bg-transparent',
                        minimal && 'bg-transparent hover:bg-transparent',
                      )}
                    >
                      <div className="flex items-center">
                        {showImagesInBadges &&
                          renderImage(option?.logoURI as string, option?.originLogoURI as string)}
                        <span>{option?.label || value}</span>
                        {showRemoveButton && (
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
              {minimal && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
            </div>
            {!minimal && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              {options.length === 0 ? (
                <div className="py-6 text-center text-sm">No options available.</div>
              ) : (
                <div className="overflow-hidden p-1 text-foreground">
                  <div className="max-h-64 overflow-auto">
                    {options.map(option => (
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
