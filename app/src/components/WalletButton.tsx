import { Network } from '@/models/chain'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { motion } from 'framer-motion'
import React from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import Button from './Button'

interface WalletButtonProps {
  network: Network
}

const WalletButton: React.FC<WalletButtonProps> = ({ network }) => {
  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()

  return (
    <motion.div
      key={network}
      className="flex self-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Button
        label={isConnected ? 'Disconnect' : 'Connect'}
        variant={isConnected ? 'outline' : 'primary'}
        size="sm"
        className={`${isConnected ? '' : 'w-[4.875rem]'} text-sm`}
        onClick={isConnected ? () => disconnect() : () => open()}
      />
    </motion.div>
  )
}

export default WalletButton
