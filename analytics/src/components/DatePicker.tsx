'use client'
import React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import cn from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  className?: string
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
}

export default function DatePicker({
  className,
  date,
  setDate,
  placeholder = 'Pick a date',
}: DatePickerProps) {
  return (
    <div className={cn('relative grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'LLL dd, y') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
