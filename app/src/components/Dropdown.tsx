import { FC, ReactNode, RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DropdownProps {
  isOpen: boolean
  dropdownRef: RefObject<HTMLDivElement>
  children: ReactNode
}

const Dropdown: FC<DropdownProps> = ({ isOpen, dropdownRef, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ height: '3.6rem' }}
          animate={{
            height: 'auto',
            transition: { type: 'spring', stiffness: 300, damping: 20, duration: 0.2 },
          }}
          exit={{
            height: '3.6rem',
            transition: { type: 'spring', stiffness: 300, damping: 20, duration: 0.002 },
          }}
          className="absolute left-0 right-0 top-0 z-20 overflow-hidden rounded-md border-1 border-turtle-level3 bg-white"
        >
          <ul className="flex flex-col gap-2 px-1 py-2">{children}</ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Dropdown
