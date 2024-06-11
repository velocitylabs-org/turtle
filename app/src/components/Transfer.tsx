'use client'
import { REGISTRY } from '@/config/registry'
import useChains from '@/hooks/useChains'
import useTransfer from '@/hooks/useTransfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { isValidSubstrateAddress } from '@/utils/address'
import { AnimatePresence } from 'framer-motion'
import { FC, useState } from 'react'
import AddressInput from './AddressInput'
import ChainSelect from './ChainSelect'
import Switch from './Switch'
import TokenSelect from './TokenSelect'
import TransferButton from './TransferButton'
import ValueInput from './ValueInput'
import useEnvironment from '@/hooks/useEnvironment'
import WalletButton from './WalletButton'
import useWallet from '@/hooks/useWallet'
import { convertAmount } from '@/utils/transfer'

const Transfer: FC = () => {
  // Inputs
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [token, setToken] = useState<Token | null>(null)
  const [inputAmount, setInputAmount] = useState<number | null>(null)
  const [manualRecipient, setManualRecipient] = useState<string>('')
  const [manualRecipientEnabled, setManualRecipientEnabled] = useState<boolean>(false)

  // Hooks
  const sourceWallet = useWallet(sourceChain)
  const destinationWallet = useWallet(destinationChain)
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
  const amount = convertAmount(inputAmount, token)

  // functions
  const validate = () =>
    isValid({
      sender: sourceWallet,
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
          <WalletButton network={sourceChain?.network} />
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
              options={REGISTRY[environment].tokens} // TODO: Replace with fetched tokens once 'useTokens' is implemented
              className="w-full"
            />
          </div>
        </div>

        {/* Token Amount */}
        <div>
          <span className="label label-text">Amount</span>
          <ValueInput
            value={inputAmount}
            onChange={setInputAmount}
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
        {destinationChain && (
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
                <WalletButton network={destinationChain?.network} />
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
