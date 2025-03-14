'use client'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import useEthForWEthSwap from '@/hooks/useEthForWEthSwap'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import useTransferForm from '@/hooks/useTransferForm'
import { Chain } from '@/models/chain'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { resolveDirection } from '@/services/transfer'
import { cn } from '@/utils/cn'
import {
  getAllowedDestinationChains,
  getAllowedSourceChains,
  getAllowedTokens,
} from '@/utils/routes'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import { formatAmount, getDurationEstimate } from '@/utils/transfer'
import { Signer } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { FC } from 'react'
import { Controller } from 'react-hook-form'
import ActionBanner from './ActionBanner'
import Button from './Button'
import ChainSelect from './ChainSelect'
import Credits from './Credits'
import SendButton from './SendButton'
import SubstrateWalletModal from './SubstrateWalletModal'
import { AlertIcon } from './svg/AlertIcon'
import { SwapChains } from './SwapFromToChains'
import Switch from './Switch'
import TokenAmountSelect from './TokenAmountSelect'
import TxSummary from './TxSummary'
import WalletButton from './WalletButton'

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
    bridgingFee,
    refetchFees,
    loadingFees,
    canPayFees,
    canPayAdditionalFees,
    transferStatus,
    environment,
    tokenAmountError,
    manualRecipientError,
    isBalanceAvailable,
    loadingBalance,
    balanceData,
    fetchBalance,
  } = useTransferForm()

  const {
    allowance: erc20SpendAllowance,
    loading: allowanceLoading,
    approveAllowance,
    approving: isApprovingErc20Spend,
  } = useErc20Allowance({
    context: snowbridgeContext,
    network: sourceChain?.network,
    tokenAmount,
    owner: sourceWallet?.sender?.address,
    refetchFees,
  })

  const {
    ethBalance,
    swapEthtoWEth,
    isSwapping: isSwappingEthForWEth,
  } = useEthForWEthSwap({
    env: environment,
    context: snowbridgeContext,
    chain: sourceChain,
    tokenAmount,
    owner: sourceWallet?.sender?.address,
  })

  const requiresErc20SpendApproval =
    erc20SpendAllowance !== undefined && erc20SpendAllowance < tokenAmount!.amount!

  const shouldDisplayEthToWEthSwap: boolean =
    !!sourceWallet &&
    sourceChain?.network === 'Ethereum' &&
    tokenAmount?.token?.symbol === 'wETH' &&
    !!tokenAmount?.amount &&
    !!balanceData &&
    !!ethBalance &&
    // The user wants to send more than the balance available
    tokenAmount.amount > Number(balanceData.formatted) &&
    // but they have enough ETH to make it possible
    tokenAmount.amount - Number(balanceData.formatted) < ethBalance &&
    // We don't want two ActionBanners showing up at once
    !requiresErc20SpendApproval

  const shouldDisplayRecipientWalletButton =
    !manualRecipient.enabled && sourceChain?.walletType !== destinationChain?.walletType

  // How much balance is missing considering the desired transfer amount
  const missingBalance =
    tokenAmount?.amount && balanceData ? tokenAmount.amount - Number(balanceData.formatted) : 0

  let amountPlaceholder: string
  if (loadingBalance) amountPlaceholder = 'Loading...'
  else if (!sourceWallet || !tokenAmount?.token || !sourceWallet.isConnected || !isBalanceAvailable)
    amountPlaceholder = 'Amount'
  else if (balanceData?.value === 0n) amountPlaceholder = 'No balance'
  else amountPlaceholder = formatAmount(Number(balanceData?.formatted), 'Longer')

  const direction =
    sourceChain && destinationChain ? resolveDirection(sourceChain, destinationChain) : undefined
  const durationEstimate = direction ? getDurationEstimate(direction) : undefined

  const isTransferAllowed =
    isValid &&
    !isValidating &&
    fees &&
    transferStatus === 'Idle' &&
    !requiresErc20SpendApproval &&
    !loadingFees &&
    canPayFees &&
    (bridgingFee ? canPayAdditionalFees : true)

  const shouldDisableMaxButton =
    !sourceWallet?.isConnected ||
    !tokenAmount?.token ||
    !isBalanceAvailable ||
    balanceData?.value === 0n ||
    transferStatus !== 'Idle'

  const shouldDisplayTxSummary =
    tokenAmount?.token && !allowanceLoading && !requiresErc20SpendApproval

  const shouldDisplayUsdtRevokeAllowance =
    erc20SpendAllowance !== 0 && tokenAmount?.token?.id === EthereumTokens.USDT.id

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex flex-col gap-1 rounded-3xl border-1 border-turtle-foreground bg-white p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      <div className="flex flex-col gap-5">
        {/* Source Chain */}
        <Controller
          name="sourceChain"
          control={control}
          render={({ field }) => {
            const options = getAllowedSourceChains(environment)
            const reorderedOptions = reorderOptionsBySelectedItem(options, 'uid', sourceChain?.uid)

            return (
              <ChainSelect
                {...field}
                onChange={handleSourceChainChange}
                options={reorderedOptions}
                floatingLabel="From"
                placeholder="Source"
                trailing={<WalletButton walletType={sourceChain?.walletType} />}
                walletAddress={sourceWallet?.sender?.address}
                className="z-50"
                disabled={transferStatus !== 'Idle'}
              />
            )
          }}
        />

        {/* Token */}
        <Controller
          name="tokenAmount"
          control={control}
          render={({ field }) => {
            const options = getAllowedTokens(environment, sourceChain, destinationChain).map(
              token => ({
                token,
                amount: null,
                allowed: token.allowed,
              }),
            )

            const reorderedOptions = reorderOptionsBySelectedItem(
              options,
              'token.id',
              tokenAmount?.token?.id,
            )

            return (
              <TokenAmountSelect
                {...field}
                sourceChain={sourceChain}
                options={reorderedOptions}
                floatingLabel="Amount"
                disabled={transferStatus !== 'Idle' || !sourceChain}
                secondPlaceholder={amountPlaceholder}
                error={errors.tokenAmount?.amount?.message || tokenAmountError}
                trailing={
                  tokenAmount?.amount ? (
                    <></>
                  ) : (
                    <Button
                      label="Max"
                      size="sm"
                      variant="outline"
                      className="min-w-[40px]"
                      onClick={handleMaxButtonClick}
                      disabled={shouldDisableMaxButton}
                    />
                  )
                }
                className="z-40"
              />
            )
          }}
        />

        {/* Swap source and destination chains */}
        <SwapChains onClick={swapFromTo} disabled={!allowFromToSwap()} />

        {/* Destination Chain */}
        <Controller
          name="destinationChain"
          control={control}
          render={({ field }) => {
            const options = getAllowedDestinationChains(
              environment,
              sourceChain,
              tokenAmount!.token,
            )

            const reorderedOptions = reorderOptionsBySelectedItem<
              Chain & {
                allowed: boolean
              }
            >(options, 'uid', destinationChain?.uid)

            return (
              <ChainSelect
                {...field}
                onChange={handleDestinationChainChange}
                options={reorderedOptions}
                floatingLabel="To"
                placeholder="Destination"
                manualRecipient={manualRecipient}
                onChangeManualRecipient={handleManualRecipientChange}
                error={manualRecipient.enabled ? manualRecipientError : ''}
                trailing={
                  shouldDisplayRecipientWalletButton && (
                    <WalletButton walletType={destinationChain?.walletType} />
                  )
                }
                clearable
                walletAddress={destinationWallet?.sender?.address}
                className="z-30"
                disabled={transferStatus !== 'Idle' || !sourceChain || !tokenAmount?.token}
              />
            )
          }}
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
                <span className="text-xs">Double check the address to avoid losing funds</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
              text={`We need your approval to transfer this token from your wallet. ${shouldDisplayUsdtRevokeAllowance ? 'USDT requires revoking the current allowance before setting a new one.' : ''}`}
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
              disabled={isSwappingEthForWEth}
              header={'Swap ETH for wETH'}
              text={'Your wETH balance is insufficient but you got enough ETH.'}
              image={<Image src={'/wallet.svg'} alt={'Wallet'} width={64} height={64} />}
              btn={{
                onClick: () =>
                  swapEthtoWEth(sourceWallet?.sender as Signer, missingBalance).then(_ =>
                    fetchBalance(),
                  ),
                label: `Swap the difference`,
              }}
            ></ActionBanner>
          </motion.div>
        )}
      </AnimatePresence>

      {shouldDisplayTxSummary && (
        <TxSummary
          loading={loadingFees}
          tokenAmount={tokenAmount}
          fees={fees}
          bridgingFees={bridgingFee}
          durationEstimate={durationEstimate}
          canPayFees={canPayFees}
          canPayAdditionalFees={canPayAdditionalFees}
          direction={direction}
          className={cn({ 'opacity-30': transferStatus !== 'Idle' })}
        />
      )}

      {/* Transfer Button */}
      <SendButton
        className="my-5 w-full"
        label="Send"
        size="lg"
        variant="primary"
        type="submit"
        loading={transferStatus !== 'Idle'}
        disabled={!isTransferAllowed}
        cypressID="form-submit"
        status={transferStatus}
      />

      <Credits />
      <SubstrateWalletModal />
    </form>
  )
}

export default Transfer
