import { FC, ReactNode, RefObject } from 'react'

interface DropdownProps {
  isOpen: boolean
  dropdownRef: RefObject<HTMLDivElement>
  children: ReactNode
}

const Dropdown: FC<DropdownProps> = ({ isOpen, dropdownRef, children }) => {
  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 z-20 max-h-60 min-h-[6rem] translate-y-[-3.58rem] overflow-auto rounded-md border-1 border-turtle-level3 bg-white"
    >
      <ul className="flex flex-col gap-2 px-1 py-2">{children}</ul>
    </div>
  )
}

export default Dropdown
