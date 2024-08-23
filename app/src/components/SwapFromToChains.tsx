import { motion } from 'framer-motion'
import { Swap } from './svg/Swap'

export const SwapChains = ({ handleChainChange }: { handleChainChange: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: 1,
        height: 'auto',
      }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.07 }}
      onClick={handleChainChange}
      className="-my-4 mx-auto flex cursor-pointer items-center justify-center space-x-0.5 p-2"
    >
      <Swap />
      <p className="xl-letter-spacing text-sm text-turtle-level6">Swap From and To</p>
    </motion.div>
  )
}
