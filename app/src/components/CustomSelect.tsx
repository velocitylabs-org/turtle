'use client'

import Image from 'next/image'
import { FC, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface SelectOption {
  id: string
  name: string
  logoURI: string
  symbol?: string
}

interface CustomSelectProps<T extends SelectOption> {
  value: T | null
  onChange: (newValue: T | null) => void
  options: T[]
  title: string
  disabled?: boolean
  className?: string
}

const CustomSelect: FC<CustomSelectProps<SelectOption>> = ({
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

  const renderOptionContent = (option: SelectOption) => {
    return (
      <button
        key={option.id}
        className="btn btn-ghost w-full justify-start rounded-lg"
        onClick={() => {
          onChange(option)
          closeDialog()
        }}
      >
        <Image
          src={option.logoURI}
          alt={option?.symbol || option.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        {option?.symbol || option.name}
      </button>
    )
  }

  return (
    <div className={twMerge(`flex items-center justify-center`, className)}>
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

      {/* Opened Select Dialog */}
      {showDialog && (
        <dialog open className="modal">
          <div className="modal-box">
            <div className="flex items-center gap-1">
              <button className="btn btn-circle btn-ghost" onClick={closeDialog}>
                {'<'}-
              </button>
              <h3 className="text-lg font-bold">{title}</h3>
            </div>

            <div className="flex flex-col gap-2">
              {options.map((option) => renderOptionContent(option))}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeDialog} />
        </dialog>
      )}
    </div>
  )
}

export default CustomSelect
