'use client'
import { SelectOption } from '@/models/selectOption'
import Image from 'next/image'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface CustomSelectProps<T> {
  /** Currently selected value, or null if no value is selected. */
  value: SelectOption<T> | null
  /** Callback function that is invoked when the selected value changes. */
  onChange: (newValue: SelectOption<T> | null) => void
  /** Array of options that the user can select from. */
  options: SelectOption<T>[]
  /** Title of the select input, displayed when no item is selected. */
  title: string
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Additional classes to apply to the select input. */
  className?: string
}

export const CustomSelect = <T,>({
  value,
  onChange,
  options,
  title,
  disabled,
  className,
}: CustomSelectProps<T>) => {
  const [showDialog, setShowDialog] = useState(false)

  const openDialog = () => setShowDialog(true)
  const closeDialog = () => setShowDialog(false)

  const handleSelectionChange = (newValue: string) => {
    const selectedOption = options.find(opt => JSON.stringify(opt.value) === newValue) || null
    onChange(selectedOption)
  }

  return (
    <div className={twMerge(`flex items-center justify-center`, className)}>
      {/* Select Button */}

      <Select onValueChange={handleSelectionChange}>
        <SelectTrigger>
          <SelectValue placeholder={title}>
            {value ? (
              <div className="flex items-center gap-2">
                <Image
                  src={value.logoURI}
                  alt={value.label}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                {value.label}
              </div>
            ) : (
              <p>{title}</p>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="bg-white">
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <SelectItem
                key={index + option.label + option.logoURI}
                value={JSON.stringify(option.value)}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={option.logoURI}
                    alt={option.label}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
      {/* <button className="w-full" onClick={openDialog} disabled={disabled}>
        {value ? (
          <div className="flex items-center gap-2">
            <Image
              src={value.logoURI}
              alt={value.label}
              width={30}
              height={30}
              className="rounded-full"
            />
            {value.label}
          </div>
        ) : (
          <p>{title}</p>
        )}
      </button> */}
      {/* Select Dialog */}
      {/* {showDialog && (
        <CustomSelectDialog
          title={title}
          options={options}
          onChange={onChange}
          onClose={closeDialog}
        />
      )} */}
    </div>
  )
}

export default CustomSelect
