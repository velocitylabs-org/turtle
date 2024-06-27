'use client'
import { nativeToken, REGISTRY } from '@/config/registry'
import useChains from '@/hooks/useChains'
import useEnvironment from '@/hooks/useEnvironment'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { truncateAddress } from '@/utils/address'
import { convertAmount } from '@/utils/transfer'
import Link from 'next/link'
import { FC, useEffect, useMemo, useState } from 'react'
import Button from './Button'
import ChainSelect from './ChainSelect'
import SubstrateWalletModal from './SubstrateWalletModal'
import Switch from './Switch'
import TokenAmountSelect from './TokenAmountSelect'
import WalletButton from './WalletButton'
import { AlertIcon } from './svg/AlertIcon'
import { ManualRecipient, TokenAmount } from '@/models/select'
import FeesPreview from './FeesPreview'
import { Fees } from '@/models/transfer'
import { Direction, getErc20TokenContract, resolveDirection } from '@/services/transfer'
import * as Snowbridge from '@snowbridge/api'
import { getContext, getEnvironment } from '@/context/snowbridge'

const Transfer: FC = () => {
  // Inputs
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [tokenAmount, setTokenAmount] = useState<TokenAmount | null>({ token: null, amount: null })
  const [manualRecipient, setManualRecipient] = useState<ManualRecipient>({
    enabled: false,
    address: '',
  })

  const [fees, setFees] = useState<Fees | null>(null)

  // Hooks
  const sourceWallet = useWallet(sourceChain?.network)
  const destinationWallet = useWallet(destinationChain?.network)
  const {
    chains: sourceChains,
    loading: loadingSourceChains,
    error: sourceChainsError,
  } = useChains({
    supportedDestChain: destinationChain ?? undefined,
    supportedToken: tokenAmount?.token ?? undefined,
  })
  const {
    chains: destChains,
    loading: loadingDestChains,
    error: destChainsError,
  } = useChains({
    supportedSourceChain: sourceChain ?? undefined,
    supportedToken: tokenAmount?.token ?? undefined,
  })
  const { environment, switchTo } = useEnvironment()
  const { transfer, isValid: _isValid, transferStatus } = useTransfer()
  const recipient = manualRecipient.enabled
    ? manualRecipient.address
    : destinationWallet?.sender?.address
  const amount = tokenAmount ? convertAmount(tokenAmount.amount, tokenAmount.token) : null

  // Functions
  const isValid = useMemo(() => {
    return _isValid({
      sender: sourceWallet?.sender,
      token: tokenAmount?.token ?? null,
      sourceChain,
      destinationChain,
      recipient: recipient,
      amount,
      fees,
    })
  }, [sourceWallet, tokenAmount, sourceChain, destinationChain, recipient, amount, _isValid])

  const handleSubmit = () => {
    // basic checks for TS type checker. But usually button should be disabled if these are not met.
    if (
      !sourceChain ||
      !recipient ||
      !sourceWallet?.sender ||
      !destinationChain ||
      !tokenAmount?.token ||
      !amount ||
      !fees
    )
      return

    transfer({
      environment,
      sender: sourceWallet.sender,
      sourceChain,
      destinationChain,
      token: tokenAmount.token,
      amount,
      recipient: recipient,
    })
  }

  /* Fetch fees */
  useEffect(() => {
    const fetchFees = async () => {
      console.log('fetchFees')
      if (!isValid) {
        console.log('not valid')
        setFees(null)
        return
      }

      if (!sourceChain || !destinationChain || !tokenAmount || !tokenAmount.token) return
      console.log('fetch fees valid')

      const snowbridgeEnv = getEnvironment(environment)
      const context = await getContext(snowbridgeEnv)
      let direction = resolveDirection(sourceChain, destinationChain)
      let token = nativeToken(sourceChain)

      switch (direction) {
        case Direction.ToEthereum: {
          let amount = await Snowbridge.toEthereum.getSendFee(context)
          setFees({
            amount,
            token,
            inDollars: 0, //todo(nuno)
          })
          await Snowbridge.toEthereum.getSendFee(context)
          break
        }
        case Direction.ToPolkadot: {
          let tokenContract = getErc20TokenContract(tokenAmount?.token, snowbridgeEnv)
          let amount = await Snowbridge.toPolkadot.getSendFee(
            context,
            tokenContract,
            destinationChain.chainId,
            BigInt(0),
          )
          setFees({
            amount,
            token,
            inDollars: 0,
          })
        }
      }
    }

    fetchFees()
  }, [isValid, sourceChain, tokenAmount, destinationChain])

  useEffect(() => {
    console.log(manualRecipient)
  }, [manualRecipient])

  return (
    <div className="z-20 flex flex-col gap-1 rounded-3xl bg-white p-5 shadow-lg backdrop-blur-sm sm:w-[31.5rem] sm:p-[2.5rem]">
      <div className="flex flex-col gap-5">
        {/* Source Chain */}
        <ChainSelect
          value={sourceChain}
          onChange={setSourceChain}
          options={sourceChains}
          floatingLabel="From"
          placeholder="Source"
          trailing={<WalletButton network={sourceChain?.network} />}
          walletAddress={truncateAddress(sourceWallet?.sender?.address || '')}
          className="z-50"
          disabled={transferStatus !== 'Idle'}
        />

        {/* Token */}
        <TokenAmountSelect
          value={tokenAmount}
          onChange={setTokenAmount}
          options={REGISTRY[environment].tokens.map(token => ({ token, amount: null }))}
          floatingLabel="Amount"
          trailing={
            <Button
              label="Max"
              size="sm"
              variant="outline"
              className="min-w-[40px]"
              disabled={
                !sourceWallet?.isConnected ||
                tokenAmount?.token === null ||
                transferStatus !== 'Idle'
              }
            />
          }
          className="z-40"
          disabled={transferStatus !== 'Idle'}
        />

        {/* Destination Chain */}
        <ChainSelect
          value={destinationChain}
          onChange={setDestinationChain}
          options={destChains}
          floatingLabel="To"
          placeholder="Destination"
          manualRecipient={manualRecipient}
          onChangeManualRecipient={setManualRecipient}
          trailing={
            !manualRecipient.enabled && <WalletButton network={destinationChain?.network} />
          }
          walletAddress={truncateAddress(destinationWallet?.sender?.address || '')}
          className="z-30"
          disabled={transferStatus !== 'Idle'}
        />
      </div>

      {/* Recipient Wallet or Address Input */}
      {destinationChain && (
        <div className="flex flex-col gap-1">
          {manualRecipient.enabled && (
            <div className="flex items-center gap-1 self-center pt-1">
              <AlertIcon />
              <span className=" text-xs">Double check address to avoid losing funds.</span>
            </div>
          )}
          {/* Switch Wallet and Manual Input */}
          <Switch
            className="items-start pt-1"
            checked={manualRecipient.enabled}
            onChange={enabled => setManualRecipient(prev => ({ ...prev, enabled }))}
            label="Send to a different address"
            disabled={transferStatus !== 'Idle'}
          />
        </div>
      )}

      {/* Fees */}
      {isValid && <FeesPreview state={!!fees ? { type: 'Ready', fees } : { type: 'Loading' }} />}

      {/* Transfer Button */}
      <Button
        label="Send"
        size="lg"
        variant="primary"
        onClick={handleSubmit}
        disabled={!isValid || !fees || transferStatus !== 'Idle'}
        className="my-5"
      />

      {/* Warning Label */}
      <div className="self-center text-sm text-turtle-level5">
        <span>This can take up to 30 minutes. </span>
        <Link href={'/'}>
          {/* TODO: update Link */}
          <span className="underline">Read more</span>
        </Link>
      </div>

      <SubstrateWalletModal />
    </div>
  )
}

export default Transfer
