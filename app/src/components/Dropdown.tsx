import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, RefObject } from 'react'

interface DropdownProps {
  isOpen: boolean
  dropdownRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

const animationProps = {
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

export default function Dropdown({ isOpen, dropdownRef, children }: DropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-0 z-20 overflow-y-auto rounded-md border border-turtle-level3 bg-white shadow-2xl"
          {...animationProps}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
