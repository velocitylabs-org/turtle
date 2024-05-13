'use client'
import Image from 'next/image'
import { FC } from 'react'
import { SelectOption } from './CustomSelect'

interface CustomSelectOptionProps {
  /** The option to render. */
  option: SelectOption
  /** Callback when the option is clicked. */
  onClick: (option: SelectOption) => void
}

const CustomSelectOption: FC<CustomSelectOptionProps> = ({ option, onClick }) => (
  <button
    key={option.id}
    className="btn btn-ghost w-full justify-start rounded-lg"
    onClick={() => onClick(option)}
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

export default CustomSelectOption
