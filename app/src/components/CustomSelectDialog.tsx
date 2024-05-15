'use client'

import { SelectOption } from '@/models/selectOption'
import CustomSelectOption from './CustomSelectOption'

interface CustomSelectDialogProps<T> {
  /** Title of the dialog. */
  title: string
  /** Options that the user can select from within the dialog. */
  options: SelectOption<T>[]
  /** Callback function that is invoked when an option is selected. */
  onChange: (option: SelectOption<T>) => void
  /** Callback function to close the dialog. */
  onClose: () => void
}

const CustomSelectDialog = <T,>({
  title,
  options,
  onChange,
  onClose,
}: CustomSelectDialogProps<T>) => {
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
              key={String(option.value)}
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
