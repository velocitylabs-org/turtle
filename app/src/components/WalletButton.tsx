import { motion } from 'framer-motion'
import React from 'react'
import EvmWalletButton from './EvmWalletButton'
import SubstrateWalletButton from './SubstrateWalletButton'
import { Network } from '@/models/chain'

interface WalletButtonProps {
  network?: Network
}

const WalletButton: React.FC<WalletButtonProps> = ({ network }) => {
  if (!network) return null

  return (
    <motion.div
      key={network}
      className="flex self-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {network === Network.Ethereum && <EvmWalletButton label="Connect EVM" />}
      {network === Network.Polkadot && <SubstrateWalletButton label="Connect Substrate" />}
    </motion.div>
  )
}

export default WalletButton
