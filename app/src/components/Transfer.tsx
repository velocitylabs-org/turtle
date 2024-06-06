'use client'
import { testTokens } from '@/__tests__/testdata'
import useChains from '@/hooks/useChains'
import useTransfer from '@/hooks/useTransfer'
import useWalletAddress from '@/hooks/useWalletAddress'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Wallet } from '@/models/wallet'
import { isValidSubstrateAddress } from '@/utils/address'
import { chainToWallet } from '@/utils/wallet'
import { AnimatePresence } from 'framer-motion'
import { FC, useEffect, useState } from 'react'
import AddressInput from './AddressInput'
import ChainSelect from './ChainSelect'
import Switch from './Switch'
import TokenSelect from './TokenSelect'
import TransferButton from './TransferButton'
import ValueInput from './ValueInput'
import WalletButton from './WalletButton'

const Transfer: FC = () => {
  // Inputs
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [token, setToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [manualReceiverAddress, setManualReceiverAddress] = useState<string>('')
  const [manualAddressInputEnabled, setManualAddressInputEnabled] = useState<boolean>(false)
  const [wallets, setWallets] = useState<{
    source?: Wallet
    destination?: Wallet
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
  const receiverWalletAddress = useWalletAddress(wallets.destination)
  const { transfer, validate } = useTransfer()

  const receiverAddress = manualAddressInputEnabled ? manualReceiverAddress : receiverWalletAddress

  useEffect(() => {
    if (sourceChain) setWallets(prev => ({ ...prev, source: chainToWallet(sourceChain) }))
  }, [sourceChain])

  useEffect(() => {
    if (destinationChain)
      setWallets(prev => ({ ...prev, destination: chainToWallet(destinationChain) }))
  }, [destinationChain])

  const isValid = () =>
    validate({
      token,
      sourceChain,
      destinationChain,
      amount,
      receiverAddress,
    })

  const handleSubmit = () => {
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
        <AnimatePresence>
          <WalletButton wallet={wallets.source} />
        </AnimatePresence>

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
        {wallets.destination && (
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
                <WalletButton wallet={wallets.destination} />
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
          disabled={!isValid()}
        />
      </div>
    </div>
  )
}

export default Transfer
