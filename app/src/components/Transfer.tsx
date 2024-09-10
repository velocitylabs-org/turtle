'use client'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import useTransferForm from '@/hooks/useTransferForm'
import { resolveDirection } from '@/services/transfer'
import {
  getAllowedDestinationChains,
  getAllowedSourceChains,
  getAllowedTokens,
  getRoute,
} from '@/utils/routes'
import { getDurationEstimate, toHuman } from '@/utils/transfer'
import { Signer } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { FC } from 'react'
import { Controller } from 'react-hook-form'
import ActionBanner from './ActionBanner'
import Button from './Button'
import ChainSelect from './ChainSelect'
import Credits from './Credits'
import FeesPreview from './FeesPreview'
import SubstrateWalletModal from './SubstrateWalletModal'
import { AlertIcon } from './svg/AlertIcon'
import { SwapChains } from './SwapFromToChains'
import Switch from './Switch'
import TokenAmountSelect from './TokenAmountSelect'
import WalletButton from './WalletButton'
import { Network } from '../models/chain'
import useEthToWEthSwap from '@/hooks/useEthToWEthSwap'

const Transfer: FC = () => {
  const { snowbridgeContext } = useSnowbridgeContext()
  const {
    control,
    errors,
    isValid,
    isValidating,
    allowFromToSwap,
    handleSubmit,
    handleSourceChainChange,
    handleDestinationChainChange,
    swapFromTo,
    handleManualRecipientChange,
    handleMaxButtonClick,
    sourceChain,
    destinationChain,
    tokenAmount,
    manualRecipient,
    sourceWallet,
    destinationWallet,
    fees,
    loadingFees,
    transferStatus,
    environment,
    tokenAmountError,
    manualRecipientError,
    isBalanceAvailable,
    loadingBalance,
    balanceData,
  } = useTransferForm()

  const {
    allowance: erc20SpendAllowance,
    approveAllowance,
    approving: isApprovingErc20Spend,
  } = useErc20Allowance({
    context: snowbridgeContext,
    network: sourceChain?.network,
    tokenAmount,
    owner: sourceWallet?.sender?.address,
  })

  const { ethBalance, swapEthtoWEth } = useEthToWEthSwap({
    context: snowbridgeContext,
    network: sourceChain?.network,
    tokenAmount,
    owner: sourceWallet?.sender?.address,
  })

  const shouldDisplayEthToWEthSwap =
    sourceWallet &&
    sourceChain?.network === Network.Ethereum &&
    tokenAmount?.token?.symbol === 'wETH' &&
    tokenAmount?.amount &&
    balanceData &&
    ethBalance &&
    // The user wants to send more than the balance available
    tokenAmount.amount > Number(balanceData.formatted) &&
    // but they have enough ETH to make it possible
    tokenAmount.amount - Number(balanceData.formatted) < ethBalance
  // How much balance the misses considering how much they wish to transfer
  const missingBalance =
    tokenAmount?.amount && balanceData ? tokenAmount.amount - Number(balanceData.formatted) : 0

  let amountPlaceholder: string
  if (
    !sourceWallet ||
    !tokenAmount?.token ||
    !sourceWallet.isConnected ||
    !isBalanceAvailable ||
    loadingBalance
  )
    amountPlaceholder = 'Amount'
  else if (balanceData?.value === 0n) amountPlaceholder = 'No balance'
  else
    amountPlaceholder = `${Number(balanceData?.formatted).toFixed(3).toString() + ' ' + tokenAmount?.token?.symbol}`

  const requiresErc20SpendApproval =
    erc20SpendAllowance !== undefined && erc20SpendAllowance < tokenAmount!.amount!

  const direction =
    sourceChain && destinationChain ? resolveDirection(sourceChain, destinationChain) : undefined
  const durationEstimate = direction ? getDurationEstimate(direction) : undefined

  const isTransferAllowed =
    isValid && !isValidating && fees && transferStatus === 'Idle' && !requiresErc20SpendApproval

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex flex-col gap-1 rounded-3xl bg-white p-5 px-[1.5rem] py-[2rem] shadow-lg backdrop-blur-sm sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      <div className="flex flex-col gap-5">
        {/* Source Chain */}
        <Controller
          name="sourceChain"
          control={control}
          render={({ field }) => (
            <ChainSelect
              {...field}
              onChange={handleSourceChainChange}
              options={getAllowedSourceChains(environment)}
              floatingLabel="From"
              placeholder="Source"
              trailing={<WalletButton addressType={sourceChain?.supportedAddressTypes.at(0)} />} // TODO: support all address types
              walletAddress={sourceWallet?.sender?.address}
              className="z-50"
              disabled={transferStatus !== 'Idle'}
            />
          )}
        />

        {/* Token */}
        <Controller
          name="tokenAmount"
          control={control}
          render={({ field }) => (
            <TokenAmountSelect
              {...field}
              options={getAllowedTokens(environment, sourceChain, destinationChain).map(token => ({
                token,
                amount: null,
                allowed: token.allowed,
              }))}
              floatingLabel="Amount"
              disabled={transferStatus !== 'Idle' || !sourceChain}
              secondPlaceholder={amountPlaceholder}
              error={errors.tokenAmount?.amount?.message || tokenAmountError}
              trailing={
                <Button
                  label="Max"
                  size="sm"
                  variant="outline"
                  className="min-w-[40px]"
                  onClick={handleMaxButtonClick}
                  disabled={
                    !sourceWallet?.isConnected ||
                    !tokenAmount?.token ||
                    !isBalanceAvailable ||
                    balanceData?.value === 0n ||
                    transferStatus !== 'Idle'
                  }
                />
              }
              className="z-40"
            />
          )}
        />

        {/* Swap source and destination chains */}
        <SwapChains onClick={swapFromTo} disabled={!allowFromToSwap()} />

        {/* Destination Chain */}
        <Controller
          name="destinationChain"
          control={control}
          render={({ field }) => (
            <ChainSelect
              {...field}
              onChange={handleDestinationChainChange}
              options={getAllowedDestinationChains(environment, sourceChain, tokenAmount!.token)}
              floatingLabel="To"
              placeholder="Destination"
              manualRecipient={manualRecipient}
              onChangeManualRecipient={handleManualRecipientChange}
              error={manualRecipient.enabled ? manualRecipientError : ''}
              trailing={
                // TODO: support all address types
                !manualRecipient.enabled &&
                sourceChain?.supportedAddressTypes.at(0) !==
                  destinationChain?.supportedAddressTypes.at(0) && (
                  <WalletButton addressType={destinationChain?.supportedAddressTypes.at(0)} />
                )
              }
              walletAddress={destinationWallet?.sender?.address}
              className="z-30"
              disabled={transferStatus !== 'Idle' || !sourceChain || !tokenAmount?.token}
            />
          )}
        />
      </div>

      {destinationChain && (
        <div className="flex flex-col gap-1">
          {/* Switch between Wallet and Manual Input */}
          <Controller
            name="manualRecipient.enabled"
            control={control}
            render={({ field }) => (
              <Switch
                {...field}
                checked={field.value}
                className="items-start pt-1"
                label="Send to a different address"
                disabled={transferStatus !== 'Idle'}
              />
            )}
          />

          {/* Manual input warning */}
          <AnimatePresence>
            {manualRecipient.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.07 }}
                className="flex items-center gap-1 self-center pt-1"
              >
                <AlertIcon />
                <span className="text-xs">Double check address to avoid losing funds.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div>${ethBalance ?? 0n}</div>

      {/* ERC-20 Spend Approval */}
      <AnimatePresence>
        {requiresErc20SpendApproval && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 self-center pt-1"
          >
            <ActionBanner
              disabled={isApprovingErc20Spend}
              header="Approve ERC-20 token spend"
              text="We first need your approval to transfer this token from your wallet."
              image={
                <Image src={'/wallet.svg'} alt={'Wallet illustration'} width={64} height={64} />
              }
              btn={{
                onClick: () => approveAllowance(sourceWallet?.sender as Signer),
                label: 'Sign now',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beta warning */}
      <AnimatePresence>
        {environment &&
          sourceChain &&
          destinationChain &&
          getRoute(environment, sourceChain, destinationChain)?.sdk === 'AssetTransferApi' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1 self-center pt-1"
            >
              <ActionBanner
                disabled={false}
                header={'Watch it!'}
                text={
                  'This flow is still in beta. It should work out fine but proceed at your own risk.'
                }
                image={<Image src={'/wip.png'} alt={'Warning'} width={64} height={64} />}
              ></ActionBanner>
            </motion.div>
          )}
      </AnimatePresence>

      {/* ETH to wETH Conversion */}
      <AnimatePresence>
        {shouldDisplayEthToWEthSwap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 self-center pt-1"
          >
            <ActionBanner
              disabled={false}
              header={'Swap ETH to wETH'}
              text={'Your wETH balance is insufficient but you got enough ETH.'}
              image={<Image src={'/wallet.svg'} alt={'Wallet'} width={64} height={64} />}
              btn={{
                onClick: () => swapEthtoWEth(sourceWallet?.sender as Signer, missingBalance),
                label: `Swap now`,
              }}
            ></ActionBanner>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fees */}
      <FeesPreview
        hidden={!isValid || requiresErc20SpendApproval}
        loading={loadingFees || !fees}
        fees={fees}
        durationEstimate={durationEstimate}
      />

      {/* Transfer Button */}
      <Button
        className="my-5"
        label="Send"
        size="lg"
        variant="primary"
        type="submit"
        loading={transferStatus !== 'Idle'}
        disabled={!isTransferAllowed}
        cypressID="form-submit"
      />

      <Credits />
      <SubstrateWalletModal />
    </form>
  )
}

export default Transfer
