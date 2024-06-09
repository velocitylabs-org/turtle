'use client'
import { testTokens } from '@/__tests__/testdata'
import useChains from '@/hooks/useChains'
import useTransfer from '@/hooks/useTransfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { chainToWalletType, WalletType } from '@/models/wallet'
import { isValidSubstrateAddress } from '@/utils/address'
import { AnimatePresence } from 'framer-motion'
import { FC, useEffect, useState } from 'react'
import AddressInput from './AddressInput'
import ChainSelect from './ChainSelect'
import Switch from './Switch'
import TokenSelect from './TokenSelect'
import TransferButton from './TransferButton'
import ValueInput from './ValueInput'
import useEnvironment from '@/hooks/useEnvironment'
import WalletButton from './WalletButton'
import useWallet from '@/hooks/useWallet'

const Transfer: FC = () => {
  // Inputs
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [token, setToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [manualRecipient, setManualRecipient] = useState<string>('')
  const [manualRecipientEnabled, setManualRecipientEnabled] = useState<boolean>(false)
  const [wallets, setWallets] = useState<{
    source?: WalletType
    destination?: WalletType
  }>({})

  // Hooks
  const sourceWallet = useWallet(wallets.source)
  const destinationWallet = useWallet(wallets.destination)

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

  const { environment, switchTo } = useEnvironment()
  const { transfer, isValid } = useTransfer()

  const recipient = manualRecipientEnabled ? manualRecipient : destinationWallet?.address

  useEffect(() => {
    if (sourceChain) setWallets(prev => ({ ...prev, source: chainToWalletType(sourceChain) }))
  }, [sourceChain])

  useEffect(() => {
    if (destinationChain)
      setWallets(prev => ({ ...prev, destination: chainToWalletType(destinationChain) }))
  }, [destinationChain])

  const validate = () =>
    isValid({
      sender: wallets.source,
      token,
      sourceChain,
      destinationChain,
      recipient: recipient,
      amount,
    })

  const handleSubmit = () => {
    // basic checks for TS type checker. But usually button should be disabled if these are not met.
    if (!sourceChain || !recipient || !sourceWallet || !destinationChain || !token || !amount)
      return

    transfer({
      environment,
      sender: sourceWallet!,
      sourceChain,
      destinationChain,
      token,
      amount,
      recipient: recipient,
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

        {/* Recipient Wallet or Address Input */}
        {wallets.destination && (
          <div>
            <span className="label label-text">Recipient Address</span>

            {manualRecipientEnabled ? (
              <AddressInput
                value={manualRecipient}
                onChange={setManualRecipient}
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
              checked={manualRecipientEnabled}
              onChange={setManualRecipientEnabled}
              label="Send to a different address"
            />
          </div>
        )}

        {/* Transfer Button */}
        <TransferButton label="Transfer" onClick={handleSubmit} disabled={!validate()} />
      </div>
    </div>
  )
}

export default Transfer
