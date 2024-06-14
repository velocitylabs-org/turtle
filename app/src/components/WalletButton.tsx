import { Network } from '@/models/chain'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { motion } from 'framer-motion'
import React from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import Button from './Button'
import SubstrateWalletModal from './SubstrateWalletModal'

interface WalletButtonProps {
  network: Network
}

const WalletButton: React.FC<WalletButtonProps> = ({ network }) => {
  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const [substrateModalOpen, setSubstrateModalOpen] = React.useState(false)

  let buttonfunc
  if (network === Network.Polkadot) {
    buttonfunc = () => setSubstrateModalOpen(true)
  } else if (network === Network.Ethereum) {
    buttonfunc = isConnected ? () => disconnect() : () => open()
  }

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
        onClick={buttonfunc}
      />

      <SubstrateWalletModal
        open={substrateModalOpen}
        onClose={() => setSubstrateModalOpen(false)}
      />
    </motion.div>
  )
}

export default WalletButton
