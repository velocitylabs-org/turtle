import useEvmWallet from '@/hooks/useEvmWallet'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Network } from '@/models/chain'
import { motion } from 'framer-motion'
import React from 'react'
import Button from './Button'
import SubstrateWalletModal from './SubstrateWalletModal'

interface WalletButtonProps {
  network: Network
}

/**
 * Wallet button component that is intended to support connecting to various different networks.
 * @param network - The network to connect to.
 */
const WalletButton: React.FC<WalletButtonProps> = ({ network }) => {
  const {
    disconnect: disconnectEvm,
    isConnected: evmIsConnected,
    openModal: openEvm,
    closeModal: closeEvm,
  } = useEvmWallet()
  const {
    disconnect: disconnectSubstrate,
    isConnected: substrateIsConnected,
    openModal: openSubstrate,
    closeModal: closeSubstrate,
    modalOpen: substrateModalOpen,
  } = useSubstrateWallet()

  const { buttonFunction, isConnected } = (() => {
    switch (network) {
      case Network.Polkadot:
        return {
          buttonFunction: substrateIsConnected ? disconnectSubstrate : () => openSubstrate(),
          isConnected: substrateIsConnected,
        }
      case Network.Ethereum:
        return {
          buttonFunction: evmIsConnected ? disconnectEvm : openEvm,
          isConnected: evmIsConnected,
        }
      default:
        throw new Error(`Unsupported network used: ${network}`)
    }
  })()

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
        onClick={buttonFunction}
      />

      <SubstrateWalletModal open={substrateModalOpen} onClose={() => closeSubstrate()} />
    </motion.div>
  )
}

export default WalletButton
