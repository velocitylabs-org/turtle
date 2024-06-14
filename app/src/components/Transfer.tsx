'use client'
import { REGISTRY } from '@/config/registry'
import useChains from '@/hooks/useChains'
import useEnvironment from '@/hooks/useEnvironment'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { isValidSubstrateAddress } from '@/utils/address'
import { convertAmount } from '@/utils/transfer'
import { AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FC, useMemo, useState } from 'react'
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
  const [manualRecipient, setManualRecipient] = useState<{ enabled: boolean; address: string }>({
    enabled: false,
    address: '',
  })

  // Hooks
  const sourceWallet = useWallet(sourceChain?.network)
  const destinationWallet = useWallet(destinationChain?.network)
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
  const { transfer, isValid: _isValid } = useTransfer()
  const recipient = manualRecipient.enabled
    ? manualRecipient.address
    : destinationWallet?.sender?.address
  const amount = convertAmount(inputAmount, token)

  // Functions
  const isValid = useMemo(() => {
    return _isValid({
      sender: sourceWallet?.sender,
      token,
      sourceChain,
      destinationChain,
      recipient: recipient,
      amount,
    })
  }, [sourceWallet, token, sourceChain, destinationChain, recipient, amount, _isValid])

  const handleSubmit = () => {
    // basic checks for TS type checker. But usually button should be disabled if these are not met.
    if (
      !sourceChain ||
      !recipient ||
      !sourceWallet?.sender ||
      !destinationChain ||
      !token ||
      !amount
    )
      return

    transfer({
      environment,
      sender: sourceWallet.sender,
      sourceChain,
      destinationChain,
      token,
      amount,
      recipient: recipient,
    })
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-4xl border-1 border-black bg-white p-[2.5rem] backdrop-blur-sm sm:min-w-[31.5rem]">
      {/* Source Wallet Connection */}
      {sourceChain?.network && (
        <AnimatePresence>
          <WalletButton network={sourceChain?.network} />
        </AnimatePresence>
      )}

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
        options={REGISTRY[environment].tokens} // TODO: Replace with fetched tokens once 'useTokens' is implemented
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

          {manualRecipient.enabled ? (
            <AddressInput
              value={manualRecipient.address}
              onChange={address => setManualRecipient(prev => ({ ...prev, address }))}
              validateAddress={isValidSubstrateAddress}
            />
          ) : (
            destinationChain?.network && (
              <AnimatePresence>
                <WalletButton network={destinationChain.network} />
              </AnimatePresence>
            )
          )}

          {/* Switch Wallet and Manual Input */}
          <Switch
            className="items-start"
            checked={manualRecipient.enabled}
            onChange={enabled => setManualRecipient(prev => ({ ...prev, enabled }))}
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
        disabled={!isValid}
      />

      {/* Warning Label */}
      <div className="self-center text-sm text-turtle-level5">
        <span>This can take up to 30 minutes. </span>
        <Link href={'/'}>
          {/* TODO: update Link */}
          <span className="underline">Read more</span>
        </Link>
      </div>
    </div>
  )
}

export default Transfer
