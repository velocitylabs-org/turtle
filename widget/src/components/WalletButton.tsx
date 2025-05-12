import { Button } from '@velocitylabs-org/turtle-ui'
import { motion } from 'framer-motion'
import useEvmWallet from '@/hooks/useEvmWallet'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { WalletType } from '@/models/chain'
import { cn } from '@/utils/helper'

interface WalletButtonProps {
  /** The wallet type of the chain. */
  walletType?: WalletType
  /** Additional classes to apply to the button. */
  className?: string
}

/** Wallet button component that is intended to support connecting to various different networks based on its address type. */
const WalletButton = ({ walletType, className }: WalletButtonProps) => {
  const {
    disconnect: disconnectEvm,
    isConnected: evmIsConnected,
    openModal: openEvm,
  } = useEvmWallet()

  const {
    disconnectSubstrate: disconnectSubstrate,
    isSubstrateConnected: substrateIsConnected,
    disconnectEvm: disconnectSubstrateEvm,
    isEvmConnected: substrateEvmIsConnected,
    openModal: openSubstrate,
    setType,
  } = useSubstrateWallet()

  const { buttonFunction, isConnected, disabled } = (() => {
    switch (walletType) {
      case 'EVM':
        return {
          buttonFunction: evmIsConnected ? disconnectEvm : () => openEvm(),
          isConnected: evmIsConnected,
          disabled: false,
        }

      case 'Substrate':
        return {
          buttonFunction: substrateIsConnected
            ? disconnectSubstrate
            : () => {
                setType('Substrate')
                openSubstrate()
              },
          isConnected: substrateIsConnected,
          disabled: false,
        }

      case 'SubstrateEVM':
        return {
          buttonFunction: substrateEvmIsConnected
            ? disconnectSubstrateEvm
            : () => {
                setType('SubstrateEVM')
                openSubstrate()
              },
          isConnected: substrateEvmIsConnected,
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
      key={walletType}
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
