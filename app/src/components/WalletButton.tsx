import { Wallet, WalletType } from '@/models/wallet'
import { motion } from 'framer-motion'
import React from 'react'
import EvmWalletButton from './EvmWalletButton'
import SubstrateWalletButton from './SubstrateWalletButton'

interface WalletButtonProps {
  wallet?: WalletType
}

const WalletButton: React.FC<WalletButtonProps> = ({ wallet }) => {
  if (!wallet) return null

  return (
    <motion.div
      key={wallet}
      className="flex self-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {wallet === WalletType.EVM && <EvmWalletButton label="Connect EVM" />}

      {wallet === WalletType.Substrate && <SubstrateWalletButton label="Connect Substrate" />}
    </motion.div>
  )
}

export default WalletButton
