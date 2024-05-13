'use client'
import React from 'react'
import { SelectOption } from './CustomSelect'
import CustomSelectOption from './CustomSelectOption'

interface CustomSelectDialogProps {
  /** Title of the dialog. */
  title: string
  /** Options that the user can select from within the dialog. */
  options: SelectOption[]
  /** Callback function that is invoked when an option is selected. */
  onChange: (option: SelectOption) => void
  /** Callback function to close the dialog. */
  onClose: () => void
}

const CustomSelectDialog: React.FC<CustomSelectDialogProps> = ({
  title,
  options,
  onChange,
  onClose,
}) => {
  return (
    <dialog open className="modal">
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center gap-1">
          <button className="btn btn-circle btn-ghost" onClick={onClose}>
            {'<-'}
          </button>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <CustomSelectOption
              key={option.id}
              option={option}
              onClick={(opt) => {
                onChange(opt)
                onClose()
              }}
            />
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}

export default CustomSelectDialog
