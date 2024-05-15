'use client'
import { SelectOption } from '@/models/selectOption'
import Image from 'next/image'
import { FC } from 'react'

interface CustomSelectOptionProps {
  /** The option to render. */
  option: SelectOption
  /** Callback when the option is clicked. */
  onClick: (option: SelectOption) => void
}

const CustomSelectOption: FC<CustomSelectOptionProps> = ({ option, onClick }) => (
  <button
    key={option.value.toString()}
    className="btn btn-ghost w-full justify-start rounded-lg"
    onClick={() => onClick(option)}
  >
    <Image
      src={option.logoURI}
      alt={option.label}
      width={40}
      height={40}
      className="rounded-full"
    />
    {option.label}
  </button>
)

export default CustomSelectOption
