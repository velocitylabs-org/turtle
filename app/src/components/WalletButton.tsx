'use client'
import useEvmWallet from '@/hooks/useEvmWallet'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { WalletType } from '@/models/chain'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import Button from './Button'
import Cross from './svg/Cross'
import { colors } from '../../tailwind.config'

interface WalletButtonProps {
  /** The wallet type of the chain. */
  walletType?: WalletType
  /** Additional classes to apply to the button. */
  className?: string
}

const animationProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

// Wallet button component that is intended to support connecting to various different networks based on its address type.
export default function WalletButton({ walletType, className }: WalletButtonProps) {
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
    <motion.div key={walletType} className={className} data-cy="connect-button" {...animationProps}>
      <Button
        label={isConnected ? 'Disconnect' : 'Connect'}
        variant={isConnected ? 'outline' : 'primary'}
        disabled={disabled}
        size="sm"
        className={cn('text-sm', isConnected ? '' : 'md:w-[4.875rem]')}
        onClick={buttonFunction}
      >
        {isConnected ? (
          <span>
            <Cross stroke={colors['turtle-foreground']} className="md:hidden" />{' '}
            <span className="hidden md:inline">Disconnect</span>
          </span>
        ) : null}
      </Button>
    </motion.div>
  )
}
