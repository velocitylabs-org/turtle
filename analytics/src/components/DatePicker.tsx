'use client'
import { cn } from '@velocitylabs-org/turtle-ui'
import { format } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  className?: string
  date: Date | null
  setDate: (date: Date | null) => void
  placeholder?: string
}

export default function DatePicker({ className, date, setDate, placeholder = 'Pick a date' }: DatePickerProps) {
  return (
    <div className={cn('relative grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              <div className="flex w-full items-center justify-between">
                <span>{format(date, 'LLL dd, y')}</span>
                <span
                  role="button"
                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDate(null)
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(date: Date | undefined) => setDate(date || null)}
            required={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
