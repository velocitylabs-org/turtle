'use client'
import type { Token } from '@velocitylabs-org/turtle-registry'
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

interface SingleSelectProps {
  options: Option[]
  selected: string
  onChange: (selected: string) => void
  placeholder?: string
  className?: string
  showImageInBadge?: boolean
  disabled?: boolean
  showBadge?: boolean
  minimal?: boolean
  loading?: boolean
  allowClear?: boolean
}

export default function Select({
  options,
  selected,
  onChange,
  placeholder = 'Select option...',
  className,
  showImageInBadge = true,
  disabled = false,
  showBadge = true,
  minimal,
  loading,
  allowClear = true,
}: SingleSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (disabled || loading) return

    if (selected === value) {
      if (allowClear) {
        onChange('')
      }
    } else {
      onChange(value)
    }
  }

  const handleClear = () => {
    if (disabled || loading) return
    onChange('')
  }

  const selectedOption = options.find(opt => opt.value === selected)
  const showClearButton = !disabled && allowClear && selected && !loading

  return (
    <div className={cn('relative', className)}>
      <Popover open={disabled ? false : open} onOpenChange={disabled || loading ? undefined : setOpen}>
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
            <div className={cn('flex items-center', minimal && 'flex-grow')}>
              {loading ? (
                <div className="ml-3 flex flex-grow items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary" />
                </div>
              ) : !selected ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : showBadge ? (
                <Badge
                  variant="secondary"
                  className={cn('mr-1 px-1 py-0', minimal && 'bg-transparent hover:bg-transparent')}
                >
                  <div className="flex items-center">
                    {showImageInBadge &&
                      renderImage(selectedOption?.logoURI as string, selectedOption?.originLogoURI as string)}
                    <span>{selectedOption?.label || selected}</span>
                    {showClearButton && (
                      <span
                        role="button"
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={e => {
                          e.stopPropagation()
                          handleClear()
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </span>
                    )}
                  </div>
                </Badge>
              ) : (
                <div className="flex items-center">
                  {showImageInBadge &&
                    renderImage(selectedOption?.logoURI as string, selectedOption?.originLogoURI as string)}
                  <span>{selectedOption?.label || selected}</span>
                </div>
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
                          selected === option.value ? 'bg-accent text-accent-foreground' : '',
                          !disabled && 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                          disabled && 'cursor-not-allowed opacity-50',
                        )}
                        onClick={() => !disabled && handleSelect(option.value)}
                      >
                        <Check className={cn('h-4 w-4', selected === option.value ? 'opacity-100' : 'opacity-0')} />
                        {option.logoURI && renderImage(option.logoURI as string, option?.originLogoURI as string)}
                        <span className="pr-3">{option.label}</span>
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
