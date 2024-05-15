'use client'
import { SelectOption } from '@/models/selectOption'
import Image from 'next/image'

interface CustomSelectOptionProps<T> {
  /** The option to render. */
  option: SelectOption<T>
  /** Callback when the option is clicked. */
  onClick: (option: SelectOption<T>) => void
}

const CustomSelectOption = <T,>({ option, onClick }: CustomSelectOptionProps<T>) => (
  <button className="btn btn-ghost w-full justify-start rounded-lg" onClick={() => onClick(option)}>
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
