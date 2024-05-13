'use client'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import Image from 'next/image'
import { FC, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import CustomSelectDialog from './CustomSelectDialog'

export type SelectOption = Chain & Token

interface CustomSelectProps {
  /** Currently selected value, or null if no value is selected. */
  value: SelectOption | null
  /** Callback function that is invoked when the selected value changes. */
  onChange: (newValue: SelectOption | null) => void
  /** Array of options that the user can select from. */
  options: SelectOption[]
  /** Title of the select input, displayed when no item is selected. */
  title: string
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Additional classes to apply to the select input. */
  className?: string
}

const CustomSelect: FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  title,
  disabled,
  className,
}) => {
  const [showDialog, setShowDialog] = useState(false)

  const openDialog = () => setShowDialog(true)
  const closeDialog = () => setShowDialog(false)

  return (
    <div className={twMerge(`flex items-center justify-center`, className)}>
      {/* Select Button */}
      <button className="btn w-full" onClick={openDialog} disabled={disabled}>
        {value ? (
          <div className="flex items-center gap-2">
            <Image
              src={value.logoURI}
              alt={value.name}
              width={30}
              height={30}
              className="rounded-full"
            />
            {value?.symbol || value.name}
          </div>
        ) : (
          <p>{title}</p>
        )}
      </button>

      {/* Select Dialog */}
      {showDialog && (
        <CustomSelectDialog
          title={title}
          options={options}
          onChange={onChange}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}

export default CustomSelect
