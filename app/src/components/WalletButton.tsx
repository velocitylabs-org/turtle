'use client'
import useEvmWallet from '@/hooks/useEvmWallet'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { AddressType } from '@/models/chain'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import Button from './Button'

interface WalletButtonProps {
  /** The address type of the chain. */
  addressType?: AddressType
  /** Additional classes to apply to the button. */
  className?: string
}

/** Wallet button component that is intended to support connecting to various different networks based on its address type. */
const WalletButton = ({ addressType, className }: WalletButtonProps) => {
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
    switch (addressType) {
      case AddressType.SS58:
        return {
          buttonFunction: substrateIsConnected ? disconnectSubstrate : () => openSubstrate(),
          isConnected: substrateIsConnected,
          disabled: false,
        }

      case AddressType.EVM:
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
      key={addressType}
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
        className={cn('text-sm', isConnected ? '' : 'w-[4.875rem]')}
        onClick={buttonFunction}
      />
    </motion.div>
  )
}

export default WalletButton
