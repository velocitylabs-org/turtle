'use client'
import useEvmWallet from '@/hooks/useEvmWallet'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Network } from '@/models/chain'
import { motion } from 'framer-motion'
import React from 'react'
import Button from './Button'

interface WalletButtonProps {
  /** The network to connect to. */
  network?: Network
  /** Additional classes to apply to the button. */
  className?: string
}

/**
 * Wallet button component that is intended to support connecting to various different networks.
 */
const WalletButton: React.FC<WalletButtonProps> = ({ network, className }) => {
  const {
    disconnect: disconnectEvm,
    isConnected: evmIsConnected,
    openModal: openEvm,
  } = useEvmWallet()
  const {
    disconnect: disconnectSubstrate,
    isConnected: substrateIsConnected,
    openModal: openSubstrate,
  } = useSubstrateWallet()

  const { buttonFunction, isConnected, disabled } = (() => {
    switch (network) {
      case Network.Polkadot:
        return {
          buttonFunction: substrateIsConnected ? disconnectSubstrate : () => openSubstrate(),
          isConnected: substrateIsConnected,
          disabled: false,
        }
      case Network.Ethereum:
        return {
          buttonFunction: evmIsConnected ? disconnectEvm : () => openEvm(),
          isConnected: evmIsConnected,
          disabled: false,
        }
      default:
        return {
          buttonFunction: () => {},
          isConnected: false,
          disabled: true,
        }
    }
  })()

  return (
    <motion.div
      key={network}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-cy="connect-button"
    >
      <Button
        label={isConnected ? 'Disconnect' : 'Connect'}
        variant={isConnected ? 'outline' : 'primary'}
        disabled={disabled}
        size="sm"
        className={`${isConnected ? '' : 'w-[4.875rem]'} text-sm`}
        onClick={buttonFunction}
      />
    </motion.div>
  )
}

export default WalletButton
