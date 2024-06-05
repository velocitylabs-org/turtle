'use client'
import { testTokens } from '@/__tests__/testdata'
import useChains from '@/hooks/useChains'
import useTransfer from '@/hooks/useTransfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { chainToWalletType, WalletType } from '@/models/walletType'
import { isValidSubstrateAddress } from '@/utils/address'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import AddressInput from './AddressInput'
import ChainSelect from './ChainSelect'
import ConnectEvmWalletButton from './ConnectEvmWalletButton'
import ConnectSubstrateWalletButton from './ConnectSubstrateWalletButton'
import Switch from './Switch'
import TokenSelect from './TokenSelect'
import TransferButton from './TransferButton'
import ValueInput from './ValueInput'

const Transfer: FC = () => {
  // Inputs
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [token, setToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [manualReceiverAddress, setManualReceiverAddress] = useState<string>('')
  const [manualAddressInputEnabled, setManualAddressInputEnabled] = useState<boolean>(false)
  const [walletTypes, setWalletTypes] = useState<{
    source?: WalletType
    destination?: WalletType
  }>({})

  const {
    chains: sourceChains,
    loading: loadingSourceChains,
    error: sourceChainsError,
  } = useChains({
    supportedDestChain: destinationChain ?? undefined,
    supportedToken: token ?? undefined,
  })
  const {
    chains: destChains,
    loading: loadingDestChains,
    error: destChainsError,
  } = useChains({
    supportedSourceChain: sourceChain ?? undefined,
    supportedToken: token ?? undefined,
  })
  const { transfer, isValid } = useTransfer()
  const evmAccount = useAccount()

  useEffect(() => {
    if (sourceChain) setWalletTypes(prev => ({ ...prev, source: chainToWalletType(sourceChain) }))
  }, [sourceChain])

  useEffect(() => {
    if (destinationChain)
      setWalletTypes(prev => ({ ...prev, destination: chainToWalletType(destinationChain) }))
  }, [destinationChain])

  const getReceiverAddress = () => {
    if (manualAddressInputEnabled) return manualReceiverAddress
    if (walletTypes.destination === WalletType.EVM) return evmAccount.address
    if (walletTypes.destination === WalletType.SUBSTRATE) return undefined // TODO: Placeholder to get Substrate address from connected wallet. This will be added once substrate connection is fixed.

    return undefined
  }

  const isTransferValid = () =>
    isValid({
      token,
      sourceChain,
      destinationChain,
      amount,
      receiverAddress: getReceiverAddress(),
    })

  const handleSubmit = () => {
    // get receiver address based on manual input or connected wallet
    let receiverAddress = getReceiverAddress()

    // basic checks for TS type checker. But usually button should be disabled if these are not met.
    if (!sourceChain || !destinationChain || !token || !amount || !receiverAddress) return

    transfer({
      sourceChain,
      destinationChain,
      token,
      amount,
      receiverAddress,
    })
  }

  return (
    <div className="card w-full max-w-xl rounded-lg border-2 border-primary bg-gray-800 bg-opacity-25 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {/* Source Wallet Connection */}
        <AnimatePresence>{renderWalletButton(walletTypes.source, 'source')}</AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-6">
          {/* Source Chain */}
          <div>
            <span className="label label-text">Source Chain</span>
            <ChainSelect
              value={sourceChain}
              onChange={setSourceChain}
              options={sourceChains}
              title="Select Source Chain"
              className="w-full"
            />
          </div>

          {/* Token */}
          <div>
            <span className="label label-text">Token</span>
            <TokenSelect
              value={token}
              onChange={setToken}
              options={testTokens} // TODO: Replace with fetched tokens once 'useTokens' is implemented
              className="w-full"
            />
          </div>
        </div>

        {/* Token Amount */}
        <div>
          <span className="label label-text">Amount</span>
          <ValueInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
            disabled={!token}
            unit={token?.symbol}
            className="w-full"
          />
        </div>

        {/* Destination Chain */}
        <div>
          <span className="label label-text">Destination Chain</span>
          <ChainSelect
            value={destinationChain}
            onChange={setDestinationChain}
            options={destChains}
            title="Select Destination Chain"
            className="w-full"
          />
        </div>

        {/* Receiver Wallet or Address Input */}
        {walletTypes.destination && (
          <div>
            <span className="label label-text">Receiver Address</span>
            {manualAddressInputEnabled ? (
              <AddressInput
                value={manualReceiverAddress}
                onChange={setManualReceiverAddress}
                validateAddress={isValidSubstrateAddress}
              />
            ) : (
              <AnimatePresence>
                {renderWalletButton(walletTypes.destination, 'destination')}
              </AnimatePresence>
            )}

            {/* Switch Wallet and Manual Input */}
            <Switch
              className="items-start"
              checked={manualAddressInputEnabled}
              onChange={setManualAddressInputEnabled}
              label="Send to a different address"
            />
          </div>
        )}

        {/* Transfer Button */}
        <TransferButton
          className="max-w-xs self-center"
          label="Transfer"
          onClick={handleSubmit}
          disabled={!isTransferValid()}
        />
      </div>
    </div>
  )
}

const renderWalletButton = (walletType: WalletType | undefined, key: string) => {
  if (!walletType) return null
  return (
    <motion.div
      key={key}
      className="flex self-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {walletType === WalletType.EVM && <ConnectEvmWalletButton label="Connect EVM" />}
      {walletType === WalletType.SUBSTRATE && (
        <ConnectSubstrateWalletButton label="Connect Substrate" />
      )}
    </motion.div>
  )
}

export default Transfer
