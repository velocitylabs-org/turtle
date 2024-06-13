'use client'
import { testTokens } from '@/__tests__/testdata'
import useChains from '@/hooks/useChains'
import useEnvironment from '@/hooks/useEnvironment'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { isValidSubstrateAddress } from '@/utils/address'
import { convertAmount } from '@/utils/transfer'
import { AnimatePresence } from 'framer-motion'
import { FC, useState } from 'react'
import AddressInput from './AddressInput'
import Button from './Button'
import ChainSelect from './ChainSelect'
import Switch from './Switch'
import TokenSelect from './TokenSelect'
import ValueInput from './ValueInput'
import WalletButton from './WalletButton'

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
    <div className="flex w-full max-w-md flex-col gap-4 rounded-4xl border-2 border-black bg-white p-8 backdrop-blur-sm">
      {/* Source Wallet Connection */}
      <AnimatePresence>
        <WalletButton network={sourceChain?.network} />
      </AnimatePresence>

      {/* Source Chain */}

      <ChainSelect
        value={sourceChain}
        onChange={setSourceChain}
        options={sourceChains}
        title="Select Source Chain"
        className="w-full"
      />

      {/* Token */}

      <TokenSelect
        value={token}
        onChange={setToken}
        options={testTokens} // TODO: Replace with fetched tokens once 'useTokens' is implemented
        className="w-full"
      />

      {/* Token Amount */}

      <ValueInput
        value={inputAmount}
        onChange={setInputAmount}
        placeholder="0"
        disabled={!token}
        unit={token?.symbol}
        className="w-full"
      />

      {/* Destination Chain */}

      <ChainSelect
        value={destinationChain}
        onChange={setDestinationChain}
        options={destChains}
        title="Select Destination Chain"
        className="w-full"
      />

      {/* Recipient Wallet or Address Input */}
      {destinationChain && (
        <div className="flex flex-col gap-3">
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
      <Button
        label="Transfer"
        size="lg"
        variant="primary"
        onClick={handleSubmit}
        disabled={!validate()}
      />
    </div>
  )
}

export default Transfer
