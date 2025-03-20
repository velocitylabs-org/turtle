import { AnimatePresence, motion } from 'framer-motion'
import { FC, ReactNode, RefObject } from 'react'

interface DropdownProps {
  isOpen: boolean
  dropdownRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

const dropdownAnimationProps = {
  initial: { height: '3.6rem' },
  animate: {
    height: 'auto',
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.3,
    },
  },
  exit: {
    height: '3.6rem',
    transition: { duration: 0.06 },
  },
}

const Dropdown: FC<DropdownProps> = ({ isOpen, dropdownRef, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-0 z-20 overflow-y-auto rounded-md border-1 border-turtle-level3 bg-white shadow-2xl"
          {...dropdownAnimationProps}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Dropdown
