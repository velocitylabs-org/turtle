import { AnimatePresence, motion } from 'framer-motion'
import { FC, ReactNode, RefObject } from 'react'

interface DropdownProps {
  isOpen: boolean
  dropdownRef: RefObject<HTMLDivElement>
  children: ReactNode
  /** Disables scroll on dropdown. Used to disable scroll on dropdowns with few items to prevent animation flickering. */
  disableScroll?: boolean
}

const Dropdown: FC<DropdownProps> = ({ isOpen, dropdownRef, children, disableScroll }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ height: '3.6rem' }}
          animate={{
            height: 'auto',
            overflowY: disableScroll ? 'hidden' : 'auto',
            transition: {
              type: 'spring',
              bounce: 0.4,
              duration: 0.3,
            },
          }}
          exit={{
            height: '3.6rem',
            transition: { duration: 0.06 },
          }}
          className="absolute left-0 right-0 top-0 z-20 max-h-[18rem] scroll-m-1 rounded-md border-1 border-turtle-level3 bg-white scrollbar-thin scrollbar-track-white scrollbar-thumb-turtle-level2"
        >
          <ul className="flex flex-col gap-2 px-1 py-2">{children}</ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Dropdown
